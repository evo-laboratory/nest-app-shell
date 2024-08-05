import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthJwtService {
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    private readonly jwtService: JwtService,
  ) {}

  public sign(payload: any): Promise<any> {
    return this.jwtService.signAsync(
      { ...payload },
      {
        expiresIn: this.iamConfig.JWT_ACCESS_TOKEN_TTL,
      },
    );
  }
}
