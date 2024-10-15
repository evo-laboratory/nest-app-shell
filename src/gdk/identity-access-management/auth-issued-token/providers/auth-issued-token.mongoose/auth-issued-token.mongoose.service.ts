import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

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
import { MongoDBErrorHandler } from '@shared/mongodb';
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
    authId: Types.ObjectId | string,
    type: AUTH_TOKEN_TYPE,
    item: IAuthTokenItem,
    session?: ClientSession,
  ): Promise<IAuthIssuedToken> {
    const ACCESS_SLICE_COUNT =
      this.iamConfig.TRACK_ISSUED_ACCESS_TOKEN_COUNT || 100;
    const REFRESH_SLICE_COUNT =
      this.iamConfig.TRACK_ISSUED_REFRESH_TOKEN_COUNT || 100;
    this.Logger.verbose(
      `${authId}(${typeof authId})`,
      'pushTokenItemByAuthId(id)',
    );
    this.Logger.verbose(JsonStringify(item), 'pushTokenItemByAuthId(item)');
    this.Logger.verbose(
      session ? true : false,
      'pushTokenItemByAuthId(session)',
    );
    try {
      const updateQuery = {};
      if (type === AUTH_TOKEN_TYPE.ACCESS) {
        updateQuery['$push'] = {
          accessTokenHistoryList: {
            $each: [item],
            $slice: -ACCESS_SLICE_COUNT,
            $position: 0,
          },
        };
      } else {
        updateQuery['$push'] = {
          activeRefreshTokenList: {
            $each: [item],
            $slice: -REFRESH_SLICE_COUNT,
            $position: 0,
          },
        };
      }
      this.Logger.verbose(
        JsonStringify(updateQuery),
        'pushTokenItemByAuthId.updateQuery',
      );
      const newData = await this.AuthIssuedTokenModel.findOneAndUpdate(
        {
          authId: authId,
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
  public async getByAuthId(authId: string): Promise<IAuthIssuedToken> {
    this.Logger.verbose(authId, 'getByAuthId(authId)');
    try {
      const data = await this.AuthIssuedTokenModel.findOne({ authId }).lean();
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
          authId: authId,
        }).lean();
      }
      const newData = await this.AuthIssuedTokenModel.findOneAndUpdate(
        {
          authId: authId,
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
