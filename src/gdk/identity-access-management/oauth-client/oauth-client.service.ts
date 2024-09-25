import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AUTH_METHOD, IAuthSocialSignInUp } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import GoogleAuthClient from '@shared/google/google.auth-client';
import { MethodLogger } from '@shared/winston-logger';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { OAuth2Client } from 'google-auth-library';
import { IUnifiedOAuthUser } from './types';
@Injectable()
export class OauthClientService implements OnModuleInit {
  private OAuthClient: OAuth2Client;
  private supportedMethods = [];
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
  ) {}

  onModuleInit() {
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
      WinstonLogger.info(
        `Supported OAuth methods: ${this.supportedMethods.join(',')}`,
        {
          contextName: 'OauthClientService',
          methodName: 'onModuleInit',
        },
      );
    }
  }

  @MethodLogger()
  public async socialAuthenticate(
    dto: IAuthSocialSignInUp,
  ): Promise<IUnifiedOAuthUser> {
    try {
      if (!this.supportedMethods.includes(dto.method)) {
        const error = this.buildError(
          ERROR_CODE.AUTH_METHOD_NOT_ALLOW,
          `${dto.method} not supported`,
          400,
          'socialAuthenticate',
        );
        throw new UniteHttpException(error);
      }
      let oauthUser: IUnifiedOAuthUser;
      if (dto.method === AUTH_METHOD.GOOGLE_SIGN_IN) {
        oauthUser = await this.googleAuthenticate(dto.token);
        return oauthUser;
      } else {
        const error = this.buildError(
          ERROR_CODE.AUTH_METHOD_NOT_ALLOW,
          `${dto.method} not supported`,
          400,
          'socialAuthenticate',
        );
        throw new UniteHttpException(error);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async googleAuthenticate(token: string): Promise<IUnifiedOAuthUser> {
    try {
      const loginTicket = await this.OAuthClient.verifyIdToken({
        idToken: token,
      });
      const payload = loginTicket.getPayload();
      if (!payload) {
        const error = this.buildError(
          ERROR_CODE.GOOGLE_AUTH_FAILED,
          'Google authentication failed',
          401,
          'googleAuthenticate',
        );
        throw new UniteHttpException(error);
      }
      const unified: IUnifiedOAuthUser = {
        aud: payload.aud,
        sourceAuthMethod: AUTH_METHOD.GOOGLE_SIGN_IN,
        sub: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        displayName: '',
        avatarURL: payload.picture,
      };
      return unified;
    } catch (error) {
      return Promise.reject(error);
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
      contextName: 'OauthClientService',
      methodName: `${methodName}`,
    };
    return errorObj;
  }
}
