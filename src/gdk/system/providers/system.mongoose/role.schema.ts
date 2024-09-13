import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ROLE_SET_METHOD } from '@gdk-system/enums';
import { ROLE_MODEL_NAME } from '@gdk-system/statics';
import { IRole } from '@gdk-system/types';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';

export class Role implements IRole {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({
    type: String,
    enum: EnumToArray(ROLE_SET_METHOD),
    default: ROLE_SET_METHOD.WHITE_LIST,
  })
  setMethod: ROLE_SET_METHOD;
  @Prop({ type: [String], default: [] })
  endpointPermissions: string[];
  @Prop({ type: String, default: '' })
  description: string;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
  @Prop({ type: Number, default: Date.now() })
  updatedAt: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
export const RoleModel = MongoModelBuilder(ROLE_MODEL_NAME, RoleSchema);
