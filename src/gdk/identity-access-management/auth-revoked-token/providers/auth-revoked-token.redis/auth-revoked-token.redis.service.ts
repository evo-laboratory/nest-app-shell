import { Injectable } from '@nestjs/common';
import { AUTH_TOKEN_TYPE, IAuthDecodedToken, IAuthSignOutRes } from '@gdk-iam/auth/types';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/enums';
import { AuthRevokeRefreshTokenDto } from '@gdk-iam/auth/dto';

@Injectable()
export class AuthRevokedTokenRedisService implements AuthRevokedTokenService {
  revokeRefreshToken(verifiedToken: IAuthDecodedToken, dto: AuthRevokeRefreshTokenDto): Promise<IAuthSignOutRes> {
    throw new Error('Method not implemented.');
  }
  public async insert(
    authId: string,
    tokenId: string,
    source: AUTH_REVOKED_TOKEN_SOURCE,
    type: AUTH_TOKEN_TYPE,
  ) {
    // SADD {authId}:{tokenId} {source}
    // EXPIRE {authId}:{tokenId} type === 'ACCESS' ? 3600(1hr) : 2592000(30days)
  }

  public async check(authId: string, tokenId: string) {
    // EXISTS {authId}:{tokenId}
    return true;
  }

  public async get(authId: string, tokenId: string) {
    // GET {authId}:{tokenId}
  }

  public async listByAuthId(authId: string) {
    // SCAN 0 MATCH {authId}:*
  }
}
