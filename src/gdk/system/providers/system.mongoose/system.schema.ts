import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import { IHttpEndpoint, IRole, ISystem } from '@gdk-system/types';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { HttpEndpointSchema } from './http-endpoint.schema';
import { RoleSchema } from './role.schema';

export class System implements ISystem {
  @Prop({
    type: [RoleSchema],
    default: [],
  })
  roles: IRole[];
  @Prop({ type: Number, default: Date.now() })
  rolesUpdatedAt: number;
  @Prop({
    type: [HttpEndpointSchema],
    default: [],
  })
  endpoints: IHttpEndpoint[];
  @Prop({ type: Number, default: Date.now() })
  endpointUpdatedAt: number;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
  @Prop({ type: Number, default: Date.now() })
  updatedAt: number;
}

export const SystemSchema = SchemaFactory.createForClass(System);
export const SystemModel = MongoModelBuilder(SYSTEM_MODEL_NAME, SystemSchema);
