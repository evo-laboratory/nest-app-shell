import { Injectable } from '@nestjs/common';
import { AUTH_TOKEN_TYPE, IAuthDecodedToken } from '@gdk-iam/auth/types';
import { AUTH_REVOKED_TOKEN_SOURCE } from './enums';
import { AuthRevokeRefreshTokenDto } from '@gdk-iam/auth/dto';
import { IAuthRevokedRefreshTokenRes } from './types';

@Injectable()
export abstract class AuthRevokedTokenService {
  abstract insert(
    authId: string,
    tokenId: string,
    source: AUTH_REVOKED_TOKEN_SOURCE,
    type: AUTH_TOKEN_TYPE,
  ): Promise<any>;
  abstract check(authId: string, tokenId: string): Promise<boolean>;
  abstract get(authId: string, tokenId: string): Promise<any>;
  abstract listByAuthId(authId: string): Promise<any>;
  abstract revokeRefreshToken(
    verifiedToken: IAuthDecodedToken,
    dto: AuthRevokeRefreshTokenDto,
    source: AUTH_REVOKED_TOKEN_SOURCE,
  ): Promise<IAuthRevokedRefreshTokenRes>;
}
