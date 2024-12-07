import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';
import { IAuthSignedResult } from '@gdk-iam/auth/types';
import { IAuthGenerateCustomTokenResult } from '@gdk-iam/auth/types/auth-generate-custom-token-result.interface';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { IUser, IUserTokenPayload } from '@gdk-iam/user/types';
import {
  ExtractPropertiesFromObj,
  GenerateUUID,
  JsonStringify,
} from '@shared/helper';
import { MethodLogger } from '@shared/winston-logger';
import { IAuthJWTVerifyResult } from './types';
import { ERROR_CODE } from '@shared/exceptions';
@Injectable()
export class AuthJwtService {
  private readonly Logger = new Logger(AuthJwtService.name);
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
      this.Logger.verbose(authId, 'generateCustomToken(authId)');
      const userPayload: IUserTokenPayload =
        ExtractPropertiesFromObj<IUserTokenPayload>(
          user,
          this.iamConfig.JWT_PAYLOAD_PROPS_FROM_USER,
        );
      this.Logger.verbose(
        JsonStringify(userPayload),
        'generateCustomToken.userPayload',
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
    this.Logger.verbose(sub, 'sign(sub)');
    this.Logger.verbose(sub, 'sign(userId)');
    this.Logger.verbose(type, 'sign(type)');
    try {
      const tokenId = GenerateUUID();
      const expiresIn =
        type === AUTH_TOKEN_TYPE.ACCESS
          ? this.iamConfig.JWT_ACCESS_TOKEN_TTL
          : this.iamConfig.JWT_REFRESH_TOKEN_TTL;
      this.Logger.verbose(expiresIn, 'sign.expiresIn');
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
    this.Logger.verbose(tokenString, 'decode(tokenString)');
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
  ): Promise<IAuthJWTVerifyResult<T>> {
    this.Logger.verbose(tokenString, 'verify(tokenString)');
    this.Logger.verbose(tokenString, 'verify(specificType)');
    try {
      const token = await this.jwtService.verifyAsync<any>(tokenString, {
        issuer: this.iamConfig.JWT_ISSUER,
        audience: this.iamConfig.JWT_AUDIENCE,
        secret: this.iamConfig.JWT_SECRET,
      });
      if (specificType) {
        if (!token.tokenType || token.tokenType !== specificType) {
          return {
            decodedToken: token,
            isError: true,
            errorCode: ERROR_CODE.AUTH_TOKEN_INVALID,
          };
        }
      }
      return {
        decodedToken: token,
        isError: false,
        errorCode: null,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
