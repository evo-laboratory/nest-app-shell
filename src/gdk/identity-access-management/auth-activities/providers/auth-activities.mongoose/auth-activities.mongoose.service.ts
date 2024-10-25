import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { AUTH_ACTIVITIES_MODEL_NAME } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { AuthActivitiesService } from '@gdk-iam/auth-activities/auth-activities.service';
import {
  IAuthActivities,
  IAuthSignInFailedRecordItem,
  IAuthTokenItem,
} from '@gdk-iam/auth-activities/types';
import { MethodLogger } from '@shared/winston-logger';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { MongoDBErrorHandler, StringToObjectId } from '@shared/mongodb';
import { JsonStringify } from '@shared/helper';

import { AuthActivities } from './auth-activities.schema';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

@Injectable()
export class AuthActivitiesMongooseService implements AuthActivitiesService {
  private readonly Logger = new Logger(AuthActivitiesMongooseService.name);
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    @InjectModel(AUTH_ACTIVITIES_MODEL_NAME)
    private readonly AuthActivitiesModel: Model<AuthActivities>,
  ) {}

  @MethodLogger()
  public async pushTokenItemByAuthId(
    authId: string,
    items: IAuthTokenItem[],
    session?: ClientSession,
  ): Promise<IAuthActivities> {
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
      const check = await this.AuthActivitiesModel.findOne({
        authId: authObjectId,
      });
      if (check === null) {
        // * STEP 2A. Create new one
        this.Logger.verbose(
          'execute STEP 2A. - create new AuthActivities',
          'pushTokenItemByAuthId.check === null',
        );
        const newData = await new this.AuthActivitiesModel({
          authId: authObjectId,
          accessTokenList: accessItems,
          refreshTokenList: refreshItems,
          lastIssueAccessTokenAt: Date.now(),
          lastIssueRefreshTokenAt: Date.now(),
        }).save({ session });
        return newData;
      } else {
        // * STEP 2B. Update exist
        const ACCESS_SLICE_COUNT =
          this.iamConfig.TRACK_ISSUED_ACCESS_TOKEN_COUNT || 100;
        const REFRESH_SLICE_COUNT =
          this.iamConfig.TRACK_ISSUED_REFRESH_TOKEN_COUNT || 100;
        const flexUpdateQuery = {
          $push: {
            accessTokenList: {
              $each: accessItems,
              $slice: -ACCESS_SLICE_COUNT,
              $position: 0,
            },
            refreshTokenList: {
              $each: refreshItems,
              $slice: -REFRESH_SLICE_COUNT,
              $position: 0,
            },
          },
          $set: {},
        };
        const current = new Date().getTime();
        // * Setup Update flexUpdateQuery
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
        // * Update
        const updatedData = await this.AuthActivitiesModel.findOneAndUpdate(
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
  public async pushFailedRecordItemByAuthId(
    authId: string,
    item: IAuthSignInFailedRecordItem,
    session?: ClientSession,
  ): Promise<IAuthActivities> {
    this.Logger.verbose(
      `${authId}(${typeof authId})`,
      'pushFailedRecordItemById(id)',
    );
    this.Logger.verbose(JsonStringify(item), 'pushFailedRecordItemById(item)');
    this.Logger.verbose(
      session ? true : false,
      'pushFailedRecordItemById(session)',
    );
    try {
      const authObjectId = StringToObjectId(authId);
      // * STEP 1. Check if created before
      const check = await this.AuthActivitiesModel.findOne({
        authId: authObjectId,
      });
      if (check === null) {
        // * STEP 2A. Create new one
        this.Logger.verbose(
          'execute STEP 2A. - create new AuthActivities',
          'pushFailedRecordItemByAuthId.check === null',
        );
        const newData = await new this.AuthActivitiesModel({
          authId: authObjectId,
          accessTokenList: [],
          refreshTokenList: [],
          signInFailRecordList: [item],
        }).save({ session });
        return newData;
      } else {
        const SLICE_COUNT = this.iamConfig.TRACK_FAILED_SIGN_IN_COUNT || 20;
        const updatedData = await this.AuthActivitiesModel.findOneAndUpdate(
          {
            authId: authObjectId,
          },
          {
            $push: {
              signInFailRecordList: {
                $each: [item],
                $slice: -SLICE_COUNT,
                $position: 0,
              },
            },
          },
          { session: session },
        );
        return updatedData;
      }
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getByAuthId(authId: string): Promise<IAuthActivities> {
    this.Logger.verbose(authId, 'getByAuthId(authId)');
    try {
      const authObjectId = StringToObjectId(authId);
      const data = await this.AuthActivitiesModel.findOne({
        authId: authObjectId,
      }).lean();
      return data;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listAll(): Promise<IAuthActivities[]> {
    try {
      const data = await this.AuthActivitiesModel.find().lean();
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
  ): Promise<IAuthActivities> {
    try {
      const authObjectId = StringToObjectId(authId);
      const updateQuery = {};
      if (all) {
        updateQuery['$set'] = {
          accessTokenList: [],
          refreshTokenList: [],
        };
      } else if (tokenType === AUTH_TOKEN_TYPE.ACCESS) {
        updateQuery['$set'] = {
          accessTokenList: [],
        };
      } else if (tokenType === AUTH_TOKEN_TYPE.REFRESH) {
        updateQuery['$set'] = {
          refreshTokenList: [],
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
        return await this.AuthActivitiesModel.findOne({
          authId: authObjectId,
        }).lean();
      }
      const newData = await this.AuthActivitiesModel.findOneAndUpdate(
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
  ): Promise<IAuthActivities> {
    this.Logger.verbose(authId, 'deleteByAuthId(authId)');
    // * This should be use when delete Auth.
    try {
      const authObjectId = StringToObjectId(authId);
      const deleted = await this.AuthActivitiesModel.findOneAndDelete({
        authId: authObjectId,
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
      contextName: 'AuthActivitiesMongooseService',
      methodName: `${methodName}`,
    };
    throw new UniteHttpException(errorObj);
  }
}
