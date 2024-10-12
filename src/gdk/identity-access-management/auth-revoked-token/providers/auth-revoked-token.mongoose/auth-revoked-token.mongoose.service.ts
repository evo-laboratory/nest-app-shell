import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { IAuthRevokedToken } from '@gdk-iam/auth-revoked-token/types';
import { AUTH_REVOKED_TOKEN_MODEL_NAME } from '@gdk-iam/auth-revoked-token/statics';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { Injectable, Logger } from '@nestjs/common';
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
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/enums';

@Injectable()
export class AuthRevokedTokenMongooseService
  implements AuthRevokedTokenService
{
  private readonly Logger = new Logger(AuthRevokedTokenMongooseService.name);
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
    this.Logger.verbose(authId, 'insert(authId)');
    this.Logger.verbose(tokenId, 'insert(tokenId)');
    this.Logger.verbose(source, 'insert(source)');
    this.Logger.verbose(type, 'insert(type)');
    this.Logger.verbose(session ? true : false, 'insert(session)');
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
    this.Logger.verbose(authId, 'check(authId)');
    this.Logger.verbose(tokenId, 'check(tokenId)');
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
      this.Logger.verbose(authId, 'get(authId)');
      this.Logger.verbose(tokenId, 'get(tokenId)');
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
    this.Logger.verbose(authId, 'listByAuthId(authId)');
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
