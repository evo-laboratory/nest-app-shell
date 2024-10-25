import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import {
  IAuthRevokedRefreshTokenRes,
  IAuthRevokedToken,
} from '@gdk-iam/auth-revoked-token/types';
import { AUTH_REVOKED_TOKEN_MODEL_NAME } from '@gdk-iam/auth-revoked-token/statics';
import { IAuthDecodedToken, IAuthSignOutRes } from '@gdk-iam/auth/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { AuthSignOutDto } from '@gdk-iam/auth/dto';
import { JsonStringify } from '@shared/helper';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { ConfigType } from '@nestjs/config';
import { AuthJwtService } from '@gdk-iam/auth-jwt/auth-jwt.service';
import { AuthRevokeRefreshTokenDto } from '@gdk-iam/auth-revoked-token/dto';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

@Injectable()
export class AuthRevokedTokenMongooseService
  implements AuthRevokedTokenService
{
  private readonly Logger = new Logger(AuthRevokedTokenMongooseService.name);
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    @InjectModel(AUTH_REVOKED_TOKEN_MODEL_NAME)
    private readonly AuthRevokedTokenModel: Model<AuthRevokedToken>,
    private readonly authJwt: AuthJwtService,
  ) {}

  @MethodLogger()
  public async signOut(
    verifiedToken: IAuthDecodedToken,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes> {
    this.Logger.verbose(
      JsonStringify(verifiedToken),
      'verifiedToken(verifiedToken)',
    );
    this.Logger.verbose(JsonStringify(dto), 'signOut(dto)');
    this.Logger.verbose(
      this.iamConfig.CHECK_REVOKED_TOKEN,
      'signOut.CHECK_REVOKED_TOKEN',
    );
    if (!this.iamConfig.CHECK_REVOKED_TOKEN) {
      return {
        resultMessage: 'OK',
        isRevokedToken: false,
      };
    }
    try {
      // * Validate refresh token
      const token = await this.authJwt.verify<IAuthDecodedToken>(
        dto.token,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      await this.insert(
        verifiedToken.sub,
        token.tokenId,
        AUTH_REVOKED_TOKEN_SOURCE.USER_SIGN_OUT,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      return {
        resultMessage: 'OK',
        isRevokedToken: true,
      };
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

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
  public async revokeRefreshToken(
    verifiedToken: IAuthDecodedToken,
    dto: AuthRevokeRefreshTokenDto,
    source: AUTH_REVOKED_TOKEN_SOURCE,
  ): Promise<IAuthRevokedRefreshTokenRes> {
    this.Logger.verbose(
      JsonStringify(verifiedToken),
      'revokeRefreshToken(verifiedToken)',
    );
    this.Logger.verbose(JsonStringify(dto), 'revokeRefreshToken(dto)');
    this.Logger.verbose(
      this.iamConfig.CHECK_REVOKED_TOKEN,
      'revokeRefreshToken.CHECK_REVOKED_TOKEN',
    );
    if (!this.iamConfig.CHECK_REVOKED_TOKEN) {
      return {
        resultMessage: 'OK',
        isRevokedToken: false,
      };
    }
    try {
      // * Validate refresh token
      const token = await this.authJwt.verify<IAuthDecodedToken>(
        dto.token,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      await this.insert(
        verifiedToken.sub,
        token.tokenId,
        source,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      return {
        resultMessage: 'OK',
        isRevokedToken: true,
      };
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
