import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';
import { IAuthTokenItem } from '@gdk-iam/auth/types/auth-token-item.interface';
import { AUTH_MODEL_NAME } from '@gdk-iam/auth/types/auth.static';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from '@gdk-iam/auth/types';
import { IAuth } from '@gdk-iam/auth/types/auth.interface';
import { USER_MODEL_NAME } from '@gdk-iam/user/types/user.static';
import { AuthTokenItemSchema } from './auth-token-item.schema';
import { IUser } from '@gdk-iam/user/types/user.interface';

export type AuthDocument = HydratedDocument<Auth>;

@Schema()
export class Auth implements IAuth {
  @Prop([
    {
      type: String,
      enum: EnumToArray(AUTH_PROVIDER),
      default: AUTH_PROVIDER.MONGOOSE,
    },
  ])
  provider: AUTH_PROVIDER;
  @Prop({ type: Types.ObjectId, ref: USER_MODEL_NAME, required: true })
  userId: Types.ObjectId | IUser;
  @Prop({ type: String, default: '' })
  password: string;
  @Prop([
    {
      type: String,
      enum: EnumToArray(AUTH_CODE_USAGE),
      default: AUTH_CODE_USAGE.NOT_SET,
    },
  ])
  codeUsage: AUTH_CODE_USAGE;
  @Prop({ type: Number, default: 0 })
  codeExpiredAt: number;
  @Prop({
    type: AuthTokenItemSchema,
    default: [],
  })
  activeRefreshTokenList: IAuthTokenItem[];
  @Prop({
    type: AuthTokenItemSchema,
    default: [],
  })
  accessTokenHistoryList: IAuthTokenItem[];
  @Prop({ type: Boolean, default: false })
  isActive: boolean;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
  @Prop({ type: Number, default: Date.now() })
  updatedAt: number;
  @Prop({ type: Number, default: 0 })
  lastSignInAt: number;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ userId: 1 });
AuthSchema.index({ isActive: 1 });
AuthSchema.index({ createdAt: -1 });
AuthSchema.index({ lastSignInAt: -1 });
export const AuthModel = MongoModelBuilder(AUTH_MODEL_NAME, AuthSchema);