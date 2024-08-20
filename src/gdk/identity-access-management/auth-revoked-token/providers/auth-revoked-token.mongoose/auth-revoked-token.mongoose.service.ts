import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import {
  AUTH_REVOKED_TOKEN_MODEL_NAME,
  AUTH_REVOKED_TOKEN_SOURCE,
} from '@gdk-iam/auth-revoked-token/types';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthRevokedToken } from './auth-revoked-token.schema';

@Injectable()
export class AuthRevokedTokenMongooseService
  implements AuthRevokedTokenService
{
  constructor(
    @InjectModel(AUTH_REVOKED_TOKEN_MODEL_NAME)
    private readonly AuthRevokedTokenModel: Model<AuthRevokedToken>,
  ) {}
  public async insert(
    authId: string,
    tokenId: string,
    source: AUTH_REVOKED_TOKEN_SOURCE,
    type: AUTH_TOKEN_TYPE,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async check(authId: string, tokenId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async get(authId: string, tokenId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async listByAuthId(authId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
