import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { IUser } from '@gdk-iam/user/types/user.interface';
import { USER_MODEL_NAME } from '@gdk-iam/user/types/user.static';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @Prop({ type: String, default: '', unique: true, required: true })
  email: string;
  @Prop({ type: String, default: '' })
  firstName: string;
  @Prop({ type: String, default: '' })
  lastName: string;
  @Prop({ type: String, default: '' })
  displayName: string;
  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;
  @Prop({
    type: [String],
    default: [],
  })
  roleList: string[];
  @Prop({ type: Boolean, default: false })
  isSelfDeleted: boolean;
  @Prop({ type: Date, default: new Date() })
  selfDeletedAt: Date;
  @Prop({ type: Map, default: null })
  backupAuth: any;
  @Prop({ type: Date, default: new Date() })
  createdAt: Date;
  @Prop({ type: Date, default: new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
export const UserModel = MongoModelBuilder(USER_MODEL_NAME, UserSchema);
