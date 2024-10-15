import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { AuthIssuedTokenService } from '@gdk-iam/auth-issued-token/auth-issued-token.service';
import {
  IAuthTokenItem,
  IAuthIssuedToken,
} from '@gdk-iam/auth-issued-token/types';
import {
  AUTH_ISSUED_TOKEN_MODEL_NAME,
  AUTH_TOKEN_TYPE,
} from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { MethodLogger } from '@shared/winston-logger';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { MongoDBErrorHandler, StringToObjectId } from '@shared/mongodb';
import { JsonStringify } from '@shared/helper';

import { AuthIssuedToken } from './auth-issued-token.schema';

@Injectable()
export class AuthIssuedTokenMongooseService implements AuthIssuedTokenService {
  private readonly Logger = new Logger(AuthIssuedTokenMongooseService.name);
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    @InjectModel(AUTH_ISSUED_TOKEN_MODEL_NAME)
    private readonly AuthIssuedTokenModel: Model<AuthIssuedToken>,
  ) {}

  @MethodLogger()
  public async pushTokenItemByAuthId(
    authId: string,
    items: IAuthTokenItem[],
    session?: ClientSession,
  ): Promise<IAuthIssuedToken> {
    const accessItems = items.filter(
      (it) => it.type === AUTH_TOKEN_TYPE.ACCESS,
    );
    const refreshItems = items.filter(
      (it) => it.type === AUTH_TOKEN_TYPE.REFRESH,
    );
    if (accessItems.length + refreshItems.length !== items.length) {
      this.throwHttpError(
        ERROR_CODE.AUTH_TOKEN_TYPE_NOT_SUPPORTED,
        `expected accessItems ${accessItems.length} + refreshItems ${refreshItems.length} equal to ${items.length}`,
        400,
        'pushTokenItemByAuthId',
      );
    }
    this.Logger.verbose(
      `${authId}(${typeof authId})`,
      'pushTokenItemByAuthId(id)',
    );
    this.Logger.verbose(items.length, 'pushTokenItemByAuthId(items.length)');
    this.Logger.verbose(
      session ? true : false,
      'pushTokenItemByAuthId(session)',
    );
    try {
      const authObjectId = StringToObjectId(authId);
      // * STEP 1. Check if created before
      const check = await this.AuthIssuedTokenModel.findOne({
        authId: authObjectId,
      });
      if (check === null) {
        // * STEP 2.A Create new one
        const newData = await new this.AuthIssuedTokenModel({
          authId: authObjectId,
          accessTokenHistoryList: accessItems,
          activeRefreshTokenList: refreshItems,
          lastIssueAccessTokenAt: Date.now(),
          lastIssueRefreshTokenAt: Date.now(),
        }).save({ session });
        return newData;
      } else {
        // * STEP 2.B Update exist
        const ACCESS_SLICE_COUNT =
          this.iamConfig.TRACK_ISSUED_ACCESS_TOKEN_COUNT || 100;
        const REFRESH_SLICE_COUNT =
          this.iamConfig.TRACK_ISSUED_REFRESH_TOKEN_COUNT || 100;
        const flexUpdateQuery = {
          $push: {
            accessTokenHistoryList: {
              $each: accessItems,
              $slice: -ACCESS_SLICE_COUNT,
              $position: 0,
            },
            activeRefreshTokenList: {
              $each: refreshItems,
              $slice: -REFRESH_SLICE_COUNT,
              $position: 0,
            },
          },
          $set: {},
        };
        const current = new Date().getTime();
        items.forEach((it) => {
          if (it.type === AUTH_TOKEN_TYPE.ACCESS) {
            flexUpdateQuery['$set']['lastIssueAccessTokenAt'] = current;
          }
          if (it.type === AUTH_TOKEN_TYPE.REFRESH) {
            flexUpdateQuery['$set']['lastIssueRefreshTokenAt'] = current;
          }
        });
        this.Logger.verbose(
          JsonStringify(flexUpdateQuery),
          'pushTokenItemByAuthId.flexUpdateQuery',
        );
        const updatedData = await this.AuthIssuedTokenModel.findOneAndUpdate(
          {
            authId: authObjectId,
          },
          flexUpdateQuery,
          { session: session },
        );
        return updatedData;
      }
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getByAuthId(authId: string): Promise<IAuthIssuedToken> {
    this.Logger.verbose(authId, 'getByAuthId(authId)');
    try {
      const authObjectId = StringToObjectId(authId);
      const data = await this.AuthIssuedTokenModel.findOne({
        authId: authObjectId,
      }).lean();
      return data;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listAll(): Promise<IAuthIssuedToken[]> {
    try {
      const data = await this.AuthIssuedTokenModel.find().lean();
      return data;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async clearTokenListByAuthId(
    authId: string,
    all: boolean,
    tokenType?: AUTH_TOKEN_TYPE,
    session?: ClientSession,
  ): Promise<IAuthIssuedToken> {
    try {
      const authObjectId = StringToObjectId(authId);
      const updateQuery = {};
      if (all) {
        updateQuery['$set'] = {
          accessTokenHistoryList: [],
          activeRefreshTokenList: [],
        };
      } else if (tokenType === AUTH_TOKEN_TYPE.ACCESS) {
        updateQuery['$set'] = {
          accessTokenHistoryList: [],
        };
      } else if (tokenType === AUTH_TOKEN_TYPE.REFRESH) {
        updateQuery['$set'] = {
          activeRefreshTokenList: [],
        };
      }
      this.Logger.verbose(
        JsonStringify(updateQuery),
        'clearTokenListByAuthId.updateQuery',
      );
      if (all && tokenType) {
        this.Logger.verbose(
          `all is true, but still pass in tokenType ${tokenType}, tokenType would be ignored`,
        );
      }
      if (!all && !tokenType) {
        this.Logger.warn(
          `all is false, but didn't pass in tokenType, ignore update.`,
        );
        return await this.AuthIssuedTokenModel.findOne({
          authId: authObjectId,
        }).lean();
      }
      const newData = await this.AuthIssuedTokenModel.findOneAndUpdate(
        {
          authId: authObjectId,
        },
        updateQuery,
        { upsert: true, session: session },
      );
      return newData;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async deleteByAuthId(
    authId: string,
    session?: ClientSession,
  ): Promise<IAuthIssuedToken> {
    this.Logger.verbose(authId, 'deleteByAuthId(authId)');
    // * This should be use when delete Auth.
    try {
      const deleted = await this.AuthIssuedTokenModel.findOneAndDelete({
        authId: authId,
      });
      return deleted;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private throwHttpError(
    code: ERROR_CODE,
    msg: string,
    statusCode?: number,
    methodName?: string,
  ): IUnitedHttpException {
    const errorObj: IUnitedHttpException = {
      source: ERROR_SOURCE.NESTJS,
      errorCode: code || ERROR_CODE.UNKNOWN,
      message: msg,
      statusCode: statusCode || 500,
      contextName: 'AuthIssuedTokenMongooseService',
      methodName: `${methodName}`,
    };
    throw new UniteHttpException(errorObj);
  }
}
