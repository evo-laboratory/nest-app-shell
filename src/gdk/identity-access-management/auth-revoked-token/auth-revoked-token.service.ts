import { Injectable } from '@nestjs/common';
import { AUTH_REVOKED_TOKEN_SOURCE } from './types';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';

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
}
