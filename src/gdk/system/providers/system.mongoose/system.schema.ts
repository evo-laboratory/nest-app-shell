import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import { IClient, IHttpEndpoint, IRole, ISystem } from '@gdk-system/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { HttpEndpointSchema } from './http-endpoint.schema';
import { RoleSchema } from './role.schema';
import { ClientSchema } from './client.schema';

@Schema()
export class System implements ISystem {
  @Prop({
    type: [RoleSchema],
    default: [],
  })
  roles: IRole[];
  @Prop({ type: Date, default: new Date() })
  rolesUpdatedAt: Date;
  @Prop({
    type: [HttpEndpointSchema],
    default: [],
  })
  endpoints: IHttpEndpoint[];
  @Prop({ type: Date, default: new Date() })
  endpointUpdatedAt: Date;
  @Prop({
    type: [ClientSchema],
    default: [],
  })
  clients: IClient[];
  @Prop({ type: String, default: '' })
  newSignUpDefaultUserRole: string;
  @Prop({ type: Date, default: new Date() })
  clientUpdatedAt: Date;
  @Prop({ type: Date, default: new Date() })
  createdAt: Date;
  @Prop({ type: Date, default: new Date() })
  updatedAt: Date;
}

export const SystemSchema = SchemaFactory.createForClass(System);
export const SystemModel = MongoModelBuilder(SYSTEM_MODEL_NAME, SystemSchema);
