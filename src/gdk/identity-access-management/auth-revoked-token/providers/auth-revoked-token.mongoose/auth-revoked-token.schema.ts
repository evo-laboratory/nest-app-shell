import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IAuthRevokedToken } from '@gdk-iam/auth-revoked-token/types/auth-revoked-token.interface';
import { IAuth } from '@gdk-iam/auth/types';
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/enums';
import { AUTH_REVOKED_TOKEN_MODEL_NAME } from '@gdk-iam/auth-revoked-token/statics';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

import { EnumToArray } from '@shared/helper';
import { MongoModelBuilder } from '@shared/mongodb';
import WinstonLogger from '@shared/winston-logger/winston.logger';

const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL) || 86400;
WinstonLogger.info(
  `REFRESH_TOKEN_TTL: ${REFRESH_TOKEN_TTL}(${typeof REFRESH_TOKEN_TTL})`,
  {
    contextName: 'AuthRevokedTokenSchema',
    methodName: 'createIndex',
  },
);

export type AuthRevokedTokenDocument = HydratedDocument<AuthRevokedToken>;

@Schema()
export class AuthRevokedToken implements IAuthRevokedToken {
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_REVOKED_TOKEN_SOURCE),
    default: AUTH_REVOKED_TOKEN_SOURCE.USER_SIGN_OUT,
  })
  source: AUTH_REVOKED_TOKEN_SOURCE;
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_TOKEN_TYPE),
    default: AUTH_TOKEN_TYPE.REFRESH,
  })
  type: AUTH_TOKEN_TYPE;
  @Prop({ type: Types.ObjectId, default: null, required: true })
  authId: IAuth | Types.ObjectId;
  @Prop({ type: String, default: '', required: true })
  tokenId: string;
  @Prop({ type: Date, default: new Date() })
  revokedAt: Date;
}

export const AuthRevokedTokenSchema =
  SchemaFactory.createForClass(AuthRevokedToken);
AuthRevokedTokenSchema.index({ tokenId: 1, authId: 1 });
AuthRevokedTokenSchema.index({ authId: 1 }, { unique: true });
AuthRevokedTokenSchema.index(
  { revokedAt: 1 },
  { expireAfterSeconds: REFRESH_TOKEN_TTL },
);
export const AuthRevokedTokenModel = MongoModelBuilder(
  AUTH_REVOKED_TOKEN_MODEL_NAME,
  AuthRevokedTokenSchema,
);
