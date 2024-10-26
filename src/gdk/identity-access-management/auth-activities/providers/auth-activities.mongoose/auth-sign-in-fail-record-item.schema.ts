import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';
import { IAuthSignInFailedRecordItem } from '@gdk-iam/auth-activities/types';
import { AUTH_METHOD } from '@gdk-iam/auth/enums';
import { AUTH_SIGN_IN_FAIL_RECORD_ITEM_MODEL_NAME } from '@gdk-iam/auth/statics';

@Schema()
export class AuthSignInFailRecordItem implements IAuthSignInFailedRecordItem {
  @Prop({
    type: String,
    enum: EnumToArray(AUTH_METHOD),
    default: AUTH_METHOD.EMAIL_PASSWORD,
  })
  signInMethod: AUTH_METHOD;
  @Prop({ type: String, default: '' })
  errorCode: string;
  @Prop({ type: String, default: '' })
  ipAddress: string;
  @Prop({ type: String, default: '' })
  failedPassword: string;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
}

export const AuthSignInFailRecordItemSchema = SchemaFactory.createForClass(
  AuthSignInFailRecordItem,
);
export const AuthSignInFailRecordItemModel = MongoModelBuilder(
  AUTH_SIGN_IN_FAIL_RECORD_ITEM_MODEL_NAME,
  AuthSignInFailRecordItemSchema,
);
