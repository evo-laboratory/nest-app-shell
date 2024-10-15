import {
  IAuthIssuedToken,
  IAuthTokenItem,
} from '@gdk-iam/auth-issued-token/types';
import {
  AUTH_ISSUED_TOKEN_MODEL_NAME,
  AUTH_MODEL_NAME,
} from '@gdk-iam/auth/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { Types } from 'mongoose';
import { AuthTokenItemSchema } from './auth-token-item.schema';

@Schema()
export class AuthIssuedToken implements IAuthIssuedToken {
  @Prop({ type: Types.ObjectId, ref: AUTH_MODEL_NAME, required: true })
  authId: Types.ObjectId;
  @Prop({
    type: [AuthTokenItemSchema],
    default: [],
  })
  activeRefreshTokenList: IAuthTokenItem[];
  @Prop({
    type: [AuthTokenItemSchema],
    default: [],
  })
  accessTokenHistoryList: IAuthTokenItem[];
}

export const AuthIssuedTokenSchema =
  SchemaFactory.createForClass(AuthIssuedToken);
AuthIssuedTokenSchema.index({ authId: 1 });
export const AuthIssuedTokenModel = MongoModelBuilder(
  AUTH_ISSUED_TOKEN_MODEL_NAME,
  AuthIssuedTokenSchema,
);
