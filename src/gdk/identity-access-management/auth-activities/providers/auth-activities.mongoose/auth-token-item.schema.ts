import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AUTH_TOKEN_ITEM_MODEL_NAME } from '@gdk-iam/auth/statics';
import { AUTH_PROVIDER, AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

import { IAuthTokenItem } from '@gdk-iam/auth-activities/types';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';
@Schema()
export class AuthTokenItem implements IAuthTokenItem {
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_TOKEN_TYPE),
    default: AUTH_TOKEN_TYPE.ACCESS,
  })
  type: AUTH_TOKEN_TYPE;
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_PROVIDER),
    default: AUTH_PROVIDER.MONGOOSE,
  })
  provider: AUTH_PROVIDER;
  @Prop({ type: String, default: '', required: true })
  tokenContent: string;
  @Prop({ type: String, default: '' })
  tokenId: string;
  @Prop({ type: String, default: '' })
  issuer: string;
  @Prop({ type: Number, required: true })
  expiredAt: number;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
}

export const AuthTokenItemSchema = SchemaFactory.createForClass(AuthTokenItem);
export const AuthTokenItemModel = MongoModelBuilder(
  AUTH_TOKEN_ITEM_MODEL_NAME,
  AuthTokenItemSchema,
);
