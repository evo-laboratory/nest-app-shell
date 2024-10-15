import { Injectable } from '@nestjs/common';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { IAuthIssuedToken, IAuthTokenItem } from './types';

@Injectable()
export abstract class AuthIssuedTokenService {
  abstract pushTokenItemByAuthId(
    authId: string,
    type: AUTH_TOKEN_TYPE,
    item: IAuthTokenItem,
  ): Promise<IAuthIssuedToken>;
  abstract getByAuthId(authId: string): Promise<IAuthIssuedToken>;
  abstract listAll(): Promise<IAuthIssuedToken[]>;
  abstract clearTokenListByAuthId(
    authId: string,
    all: boolean,
    tokenType?: AUTH_TOKEN_TYPE,
  ): Promise<IAuthIssuedToken>;
  abstract deleteByAuthId(authId: string): Promise<IAuthIssuedToken>;
}
