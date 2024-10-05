import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import {
  AUTH_REVOKED_TOKEN_MODEL_NAME,
  AUTH_REVOKED_TOKEN_SOURCE,
  IAuthRevokedToken,
} from '@gdk-iam/auth-revoked-token/types';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { MongoDBErrorHandler } from '@shared/mongodb';
import { MethodLogger } from '@shared/winston-logger';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';

import {
  AuthRevokedToken,
  AuthRevokedTokenDocument,
} from './auth-revoked-token.schema';

@Injectable()
export class AuthRevokedTokenMongooseService
  implements AuthRevokedTokenService
{
  constructor(
    @InjectModel(AUTH_REVOKED_TOKEN_MODEL_NAME)
    private readonly AuthRevokedTokenModel: Model<AuthRevokedToken>,
  ) {}
  @MethodLogger()
  public async insert(
    authId: string,
    tokenId: string,
    source: AUTH_REVOKED_TOKEN_SOURCE,
    type: AUTH_TOKEN_TYPE,
    session?: ClientSession,
  ): Promise<IAuthRevokedToken> {
    try {
      const check = await this.AuthRevokedTokenModel.findOne({
        authId: authId,
        tokenId: tokenId,
      });
      if (check !== null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_REFRESH_TOKEN_ALREADY_REVOKED,
          `Already revoked`,
          403,
          'insert',
        );
        throw new UniteHttpException(error);
      }
      const newData: AuthRevokedTokenDocument =
        await new this.AuthRevokedTokenModel({
          tokenId: tokenId,
          authId: authId,
          source: source,
          type: type,
        }).save({ session: session });
      return newData.toJSON();
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async check(authId: string, tokenId: string): Promise<boolean> {
    try {
      const found = await this.AuthRevokedTokenModel.findOne({
        authId: authId,
        tokenId: tokenId,
      });
      return found === null;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async get(
    authId: string,
    tokenId: string,
  ): Promise<AuthRevokedTokenDocument> {
    try {
      const found = await this.AuthRevokedTokenModel.findOne({
        authId: authId,
        tokenId: tokenId,
      });
      return found;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listByAuthId(authId: string): Promise<IAuthRevokedToken[]> {
    try {
      const list = await this.AuthRevokedTokenModel.find({
        authId: authId,
      }).lean();
      return list;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private buildError(
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
      contextName: 'AuthRevokedTokenMongooseService',
      methodName: `${methodName}`,
    };
    return errorObj;
  }
}
