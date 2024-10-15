import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_MODEL_NAME,
  AUTH_PROVIDER,
  AUTH_METHOD,
  IAuth,
  IAuthSignInFailedRecordItem,
} from '@gdk-iam/auth/types';
import { USER_MODEL_NAME } from '@gdk-iam/user/types';
import { AuthSignInFailRecordItemSchema } from './auth-sign-in-fail-record-item.schema';

export type AuthDocument = HydratedDocument<Auth>;
@Schema()
export class Auth implements IAuth {
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_IDENTIFIER_TYPE),
    default: AUTH_IDENTIFIER_TYPE.EMAIL,
  })
  identifierType: AUTH_IDENTIFIER_TYPE;
  @Prop({ type: String, default: '', unique: true, required: true })
  identifier: string;
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_PROVIDER),
    default: AUTH_PROVIDER.MONGOOSE,
  })
  provider: AUTH_PROVIDER;
  @Prop({
    type: [String],
    enum: EnumToArray(AUTH_METHOD),
    default: AUTH_METHOD.EMAIL_PASSWORD,
  })
  signUpMethodList: AUTH_METHOD[];
  @Prop({ type: Types.ObjectId, ref: USER_MODEL_NAME, required: true })
  userId: Types.ObjectId;
  @Prop({ type: String, default: null, sparse: true })
  googleSignInId: string;
  @Prop({ type: String, default: null, sparse: true })
  appleSignInId: string;
  @Prop({ type: String, default: null, sparse: true })
  facebookSignId: string;
  @Prop({ type: String, default: null, sparse: true })
  githubSignId: string;
  @Prop({ type: String, default: null, sparse: true })
  gitlabSignId: string;
  @Prop({ type: String, default: null, sparse: true })
  microsoftSignId: string;
  @Prop({ type: String, default: '' })
  password: string;
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_CODE_USAGE),
    default: AUTH_CODE_USAGE.NOT_SET,
  })
  codeUsage: AUTH_CODE_USAGE;
  @Prop({ type: String, default: '' })
  code: string;
  @Prop({ type: Number, default: 0 })
  codeExpiredAt: number;
  @Prop({
    type: [AuthSignInFailRecordItemSchema],
    default: [],
  })
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
  @Prop({ type: Number, default: 0 })
  inactiveAt: number;
  @Prop({ type: Boolean, default: false })
  isIdentifierVerified: boolean;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
  @Prop({ type: Number, default: Date.now() })
  updatedAt: number;
  @Prop({ type: Number, default: 0 })
  lastChangedPasswordAt: number;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ identifier: 1 }, { unique: true });
AuthSchema.index({ userId: 1 }, { unique: true });
AuthSchema.index({ googleSignInId: 1 }, { unique: true });
AuthSchema.index({ appleSignInId: 1 }, { unique: true });
AuthSchema.index({ facebookSignId: 1 }, { unique: true });
AuthSchema.index({ googleSignInId: 1 }, { unique: true });
AuthSchema.index({ githubSignId: 1 }, { unique: true });
AuthSchema.index({ gitlabSignId: 1 }, { unique: true });
AuthSchema.index({ microsoftSignId: 1 }, { unique: true });
AuthSchema.index({ isActive: 1 });
AuthSchema.index({ createdAt: -1 });
export const AuthModel = MongoModelBuilder(AUTH_MODEL_NAME, AuthSchema);
