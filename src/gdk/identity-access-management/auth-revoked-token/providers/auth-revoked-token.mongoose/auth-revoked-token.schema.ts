import {
  AUTH_REVOKED_TOKEN_MODEL_NAME,
  AUTH_REVOKED_TOKEN_SOURCE,
} from '@gdk-iam/auth-revoked-token/types';
import { IAuthRevokedToken } from '@gdk-iam/auth-revoked-token/types/auth-revoked-token.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EnumToArray } from '@shared/helper';
import { IAuth } from '@gdk-iam/auth/types';
import { MongoModelBuilder } from '@shared/mongodb';

export type AuthRevokedTolenDocument = HydratedDocument<AuthRevokedToken>;

@Schema()
export class AuthRevokedToken implements IAuthRevokedToken {
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_REVOKED_TOKEN_SOURCE),
    default: AUTH_REVOKED_TOKEN_SOURCE.USER_SIGN_OUT,
  })
  source: AUTH_REVOKED_TOKEN_SOURCE;
  @Prop({ type: Types.ObjectId, default: null, required: true })
  authId: IAuth | Types.ObjectId;
  @Prop({ type: String, default: '', required: true })
  tokenId: string;
  @Prop({ type: Number, default: Date.now() })
  revokedAt: number;
}

export const AuthRevokedTokenSchema =
  SchemaFactory.createForClass(AuthRevokedToken);
AuthRevokedTokenSchema.index({ tokenId: 1, authId: 1 });
AuthRevokedTokenSchema.index({ authId: 1 });
export const AuthRevokedTokenModel = MongoModelBuilder(
  AUTH_REVOKED_TOKEN_MODEL_NAME,
  AuthRevokedTokenSchema,
);
