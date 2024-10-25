import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { IAuthSocialSignInUp } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import GoogleAuthClient from '@shared/google/google.auth-client';
import {
  MethodLogger,
  WINSTON_LOG_VARIANT_LEVEL,
} from '@shared/winston-logger';
import { JsonStringify } from '@shared/helper';
import { AUTH_METHOD } from '@gdk-iam/auth/enums';

import { IUnifiedOAuthUser } from './types';

@Injectable()
export class OauthClientService implements OnModuleInit {
  private OAuthClient: OAuth2Client;
  private supportedMethods = [];
  private readonly Logger = new Logger(OauthClientService.name);
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
  ) {}

  onModuleInit() {
    this.Logger.verbose(
      this.iamConfig.ENABLE_GOOGLE_SIGN_IN,
      'onModuleInit.ENABLE_GOOGLE_SIGN_IN',
    );
    if (this.iamConfig.ENABLE_GOOGLE_SIGN_IN) {
      if (
        !this.iamConfig.GOOGLE_CLIENT_ID ||
        !this.iamConfig.GOOGLE_CLIENT_SECRET
      ) {
        throw new Error(
          'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in the environment variables',
        );
      }
      this.OAuthClient = new GoogleAuthClient()
        .init(
          this.iamConfig.GOOGLE_CLIENT_ID,
          this.iamConfig.GOOGLE_CLIENT_SECRET,
        )
        .getInstance();
      this.supportedMethods.push(AUTH_METHOD.GOOGLE_SIGN_IN);
    }
    if (this.supportedMethods.length > 0) {
      this.Logger.log(
        `Supported OAuth methods: ${this.supportedMethods.join(',')}`,
        {
          level: WINSTON_LOG_VARIANT_LEVEL.INFO,
          methodName: 'onModuleInit',
        },
      );
    }
  }

  @MethodLogger()
  public async socialAuthenticate(
    dto: IAuthSocialSignInUp,
  ): Promise<IUnifiedOAuthUser> {
    Logger.verbose(JsonStringify(dto), 'socialAuthenticate(dto)');
    try {
      if (!this.supportedMethods.includes(dto.method)) {
        this.throwHttpError(
          ERROR_CODE.AUTH_METHOD_NOT_ALLOW,
          `${dto.method} not supported`,
          400,
          'socialAuthenticate',
        );
      }
      let oauthUser: IUnifiedOAuthUser;
      if (dto.method === AUTH_METHOD.GOOGLE_SIGN_IN) {
        oauthUser = await this.googleAuthenticate(dto.token);
        return oauthUser;
      } else {
        this.throwHttpError(
          ERROR_CODE.AUTH_METHOD_NOT_ALLOW,
          `${dto.method} not supported`,
          400,
          'socialAuthenticate',
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async googleAuthenticate(token: string): Promise<IUnifiedOAuthUser> {
    this.Logger.verbose(token, 'googleAuthenticate(token)');
    try {
      const loginTicket = await this.OAuthClient.verifyIdToken({
        idToken: token,
      });
      const payload = loginTicket.getPayload();
      this.Logger.verbose(JsonStringify(payload), 'googleAuthenticate.payload');
      if (!payload) {
        this.throwHttpError(
          ERROR_CODE.GOOGLE_AUTH_FAILED,
          'Google authentication failed',
          401,
          'googleAuthenticate',
        );
      }
      const unified: IUnifiedOAuthUser = {
        aud: payload.aud,
        sourceAuthMethod: AUTH_METHOD.GOOGLE_SIGN_IN,
        sub: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        displayName: `${payload.given_name} ${payload.family_name}`,
        avatarURL: payload.picture,
      };
      return unified;
    } catch (error) {
      return Promise.reject(error);
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
      contextName: 'OauthClientService',
      methodName: `${methodName}`,
    };
    throw new UniteHttpException(errorObj);
  }
}
