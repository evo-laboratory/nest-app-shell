import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GenerateUUID } from '@shared/helper';

@Injectable()
export class AuthJwtService {
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    private readonly jwtService: JwtService,
  ) {}

  public sign<T>(
    sub: string,
    payload: T,
    type: AUTH_TOKEN_TYPE = AUTH_TOKEN_TYPE.ACCESS,
  ): Promise<any> {
    const tokenId = GenerateUUID();
    const expiresIn =
      type === AUTH_TOKEN_TYPE.ACCESS
        ? this.iamConfig.JWT_ACCESS_TOKEN_TTL
        : this.iamConfig.JWT_REFRESH_TOKEN_TTL;
    return this.jwtService.signAsync(
      {
        tokenId: tokenId,
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
  }
}
