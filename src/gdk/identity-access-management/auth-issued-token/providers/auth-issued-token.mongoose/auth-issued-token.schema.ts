import {
  IAuthIssuedToken,
  IAuthTokenItem,
} from '@gdk-iam/auth-issued-token/types';
import { AUTH_ISSUED_TOKEN_MODEL_NAME } from '@gdk-iam/auth/types';
import { SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { Types } from 'mongoose';

export class AuthIssuedToken implements IAuthIssuedToken {
  authId: Types.ObjectId;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[];
}

export const AuthIssuedTokenSchema =
  SchemaFactory.createForClass(AuthIssuedToken);
AuthIssuedTokenSchema.index({ authId: 1 });
export const AuthIssuedTokenModel = MongoModelBuilder(
  AUTH_ISSUED_TOKEN_MODEL_NAME,
  AuthIssuedTokenSchema,
);
