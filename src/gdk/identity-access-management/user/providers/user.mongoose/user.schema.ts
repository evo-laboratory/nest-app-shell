import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../../user.interface';
import { ROLE } from '../../enums/role.enum';
import { HydratedDocument } from 'mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { USER_MODEL_NAME } from '../../user.static';
import { EnumToArray } from '@shared/helper';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements IUser {
  @Prop({ type: String, default: '', unique: true, required: true })
  authId: string;
  @Prop({ type: String, default: '', required: true })
  email: string;
  firstName: string;
  @Prop({ type: String, default: '' })
  lastName: string;
  @Prop({ type: String, default: '' })
  displayName: string;
  @Prop({ default: false })
  isEmailVerified: boolean;
  @Prop([
    {
      type: String,
      enum: EnumToArray(ROLE),
      default: ROLE.GENERAL,
    },
  ])
  roleList: ROLE[];
  @Prop({ default: Date.now() })
  createdAt: number;
  @Prop({ default: Date.now() })
  updatedAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ authId: 1 });
UserSchema.index({ email: 1 });
export const UserModel = MongoModelBuilder(USER_MODEL_NAME, UserSchema);
