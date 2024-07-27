import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAuthTokenItem } from '@gdk-iam/auth/types/auth-token-item.interface';
import { AUTH_TOKEN_ITEM_MODEL_NAME } from '@gdk-iam/auth/types/auth.static';
import { MongoModelBuilder } from '@shared/mongodb';

@Schema()
export class AuthTokenItem implements IAuthTokenItem {
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
