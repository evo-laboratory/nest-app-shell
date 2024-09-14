import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { IAuthGenerateCustomTokenResult } from '@gdk-iam/auth/types/auth-generate-custom-token-result.interface';
import { IAuthSignedResult } from '@gdk-iam/auth/types/auth-signed-result.interface';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { IUser, IUserTokenPayload } from '@gdk-iam/user/types';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ExtractPropertiesFromObj, GenerateUUID } from '@shared/helper';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class AuthJwtService {
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    private readonly jwtService: JwtService,
  ) {}

  @MethodLogger()
  public async generateCustomToken(
    authId: string,
    user: IUser,
  ): Promise<IAuthGenerateCustomTokenResult> {
    try {
      const userPayload: IUserTokenPayload =
        ExtractPropertiesFromObj<IUserTokenPayload>(
          user,
          this.iamConfig.JWT_PAYLOAD_PROPS_FROM_USER,
        );
      const access = await this.sign(
        authId,
        `${user._id}`,
        userPayload,
        AUTH_TOKEN_TYPE.ACCESS,
      );
      const refresh = await this.sign(
        authId,
        `${user._id}`,
        userPayload,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      return {
        accessTokenId: access.tokenId,
        accessToken: access.token,
        refreshTokenId: refresh.tokenId,
        refreshToken: refresh.token,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async sign<T>(
    sub: string,
    userId: string,
    payload: T,
    type: AUTH_TOKEN_TYPE = AUTH_TOKEN_TYPE.ACCESS,
  ): Promise<IAuthSignedResult> {
    try {
      const tokenId = GenerateUUID();
      const expiresIn =
        type === AUTH_TOKEN_TYPE.ACCESS
          ? this.iamConfig.JWT_ACCESS_TOKEN_TTL
          : this.iamConfig.JWT_REFRESH_TOKEN_TTL;
      const token = await this.jwtService.signAsync(
        {
          tokenId: tokenId,
          tokenType: type,
          userId: userId,
          sub: sub,
          ...payload,
        },
        {
          expiresIn: expiresIn,
          issuer: this.iamConfig.JWT_ISSUER,
          audience: this.iamConfig.JWT_AUDIENCE,
          secret: this.iamConfig.JWT_SECRET,
        },
      );
      return {
        tokenId: tokenId,
        token: token,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public decode<T>(tokenString: string): T {
    try {
      const token = this.jwtService.decode(tokenString);
      return token;
    } catch (error) {
      throw new Error(error);
    }
  }

  @MethodLogger()
  public async verify<T>(
    tokenString: string,
    specificType?: AUTH_TOKEN_TYPE,
  ): Promise<T> {
    try {
      const token = await this.jwtService.verifyAsync<any>(tokenString, {
        issuer: this.iamConfig.JWT_ISSUER,
        audience: this.iamConfig.JWT_AUDIENCE,
        secret: this.iamConfig.JWT_SECRET,
      });
      if (specificType) {
        if (!token.tokenType || token.tokenType !== specificType) {
          throw new Error('jwt type not valid');
        }
      }
      return token;
    } catch (error) {
      throw new Error(error);
    }
  }
}
