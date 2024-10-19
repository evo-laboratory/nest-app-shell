import { Injectable } from '@nestjs/common';
import {
  AUTH_TOKEN_TYPE,
  IAuthDecodedToken,
  IAuthSignOutRes,
} from '@gdk-iam/auth/types';
import { AUTH_REVOKED_TOKEN_SOURCE } from './enums';
import { AuthSignOutDto } from '@gdk-iam/auth/dto';

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
  abstract signOut(
    verifiedToken: IAuthDecodedToken,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes>;
}
