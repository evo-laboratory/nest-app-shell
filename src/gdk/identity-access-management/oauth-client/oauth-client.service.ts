import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import GoogleAuthClient from '@shared/google/google.auth-client';
import { MethodLogger } from '@shared/winston-logger';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
@Injectable()
export class OauthClientService implements OnModuleInit {
  private OAuthClient: OAuth2Client;
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
}
