import { AuthIssuedTokenService } from '@gdk-iam/auth-issued-token/auth-issued-token.service';
import {
  IAuthTokenItem,
  IAuthIssuedToken,
} from '@gdk-iam/auth-issued-token/types';
import {
  AUTH_ISSUED_TOKEN_MODEL_NAME,
  AUTH_TOKEN_TYPE,
} from '@gdk-iam/auth/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthIssuedToken } from './auth-issued-token.schema';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class AuthIssuedTokenMongooseService implements AuthIssuedTokenService {
  private readonly Logger = new Logger(AuthIssuedTokenMongooseService.name);
  constructor(
    @InjectModel(AUTH_ISSUED_TOKEN_MODEL_NAME)
    private readonly AuthIssuedTokenModel: Model<AuthIssuedToken>,
  ) {}

  @MethodLogger()
  public async pushTokenItemByAuthId(
    authId: string,
    item: IAuthTokenItem,
  ): Promise<IAuthIssuedToken> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  public async getByAuthId(authId: string): Promise<IAuthIssuedToken> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  public async listAll(): Promise<IAuthIssuedToken[]> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  public async clearTokenListByAuthId(
    authId: string,
    all: boolean,
    tokenType?: AUTH_TOKEN_TYPE,
  ): Promise<IAuthIssuedToken> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  public async deleteByAuthId(authId: string): Promise<IAuthIssuedToken> {
    throw new Error('Method not implemented.');
  }
}
