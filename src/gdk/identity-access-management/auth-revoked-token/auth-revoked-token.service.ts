import { Injectable } from '@nestjs/common';
import { IAuthDecodedToken } from '@gdk-iam/auth/types';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';
import { AUTH_REVOKED_TOKEN_SOURCE } from './enums';
import { IAuthRevokedRefreshTokenRes } from './types';
import { AuthRevokeRefreshTokenDto } from './dto';
@Injectable()
export abstract class AuthRevokedTokenService {
  abstract insert(
    authId: string,
    tokenId: string,
    source: AUTH_REVOKED_TOKEN_SOURCE,
    type: AUTH_TOKEN_TYPE,
    ignoreCheckError: boolean,
    opt: any,
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
