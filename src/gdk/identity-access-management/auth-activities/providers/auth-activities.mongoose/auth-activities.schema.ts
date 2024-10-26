import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AUTH_ACTIVITIES_MODEL_NAME,
  AUTH_MODEL_NAME,
} from '@gdk-iam/auth/statics';
import {
  IAuthActivities,
  IAuthSignInFailedRecordItem,
  IAuthTokenItem,
} from '@gdk-iam/auth-activities/types';
import { MongoModelBuilder } from '@shared/mongodb';
import { AuthTokenItemSchema } from './auth-token-item.schema';
import { AuthSignInFailRecordItemSchema } from './auth-sign-in-fail-record-item.schema';

export type AuthActivitiesDocument = HydratedDocument<AuthActivities>;
@Schema()
export class AuthActivities implements IAuthActivities {
  @Prop({ type: Types.ObjectId, ref: AUTH_MODEL_NAME, required: true })
  authId: Types.ObjectId;
  @Prop({
    type: [AuthTokenItemSchema],
    default: [],
  })
  refreshTokenList: IAuthTokenItem[];
  @Prop({
    type: [AuthTokenItemSchema],
    default: [],
  })
  accessTokenList: IAuthTokenItem[];
  @Prop({
    type: [AuthSignInFailRecordItemSchema],
    default: [],
  })
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  @Prop({ type: Number, default: 0 })
  lastIssueAccessTokenAt: number;
  @Prop({ type: Number, default: 0 })
  lastIssueRefreshTokenAt: number;
}

export const AuthActivitiesSchema =
  SchemaFactory.createForClass(AuthActivities);
AuthActivitiesSchema.index({ authId: 1 }, { unique: true });
export const AuthActivitiesModel = MongoModelBuilder(
  AUTH_ACTIVITIES_MODEL_NAME,
  AuthActivitiesSchema,
);
