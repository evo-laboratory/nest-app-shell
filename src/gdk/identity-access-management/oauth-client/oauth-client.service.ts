import { AUTH_METHOD, IAuthSocialSignInUp } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import GoogleAuthClient from '@shared/google/google.auth-client';
import { MethodLogger } from '@shared/winston-logger';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
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
    WinstonLogger.info(
      `Supported OAuth methods: ${this.supportedMethods.join(',')}`,
      {
        contextName: 'OauthClientService',
        methodName: 'onModuleInit',
      },
    );
  }

  @MethodLogger()
  public async socialAuthenticate(dto: IAuthSocialSignInUp) {
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
      return await this.googleAuthenticate(dto.token);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async googleAuthenticate(token: string): Promise<LoginTicket> {
    try {
      const loginTicket = await this.OAuthClient.verifyIdToken({
        idToken: token,
      });
      return loginTicket;
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
