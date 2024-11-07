import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IClient } from '@gdk-system/types';
import { MongoModelBuilder } from '@shared/mongodb';
import { CLIENT_MODEL_NAME } from '@gdk-system/statics';

@Schema({
  _id: false,
})
export class Client implements IClient {
  @Prop({ type: String, default: '' })
  id: string;
  @Prop({ type: String, default: '' })
  name: string;
  @Prop({ type: Boolean, default: true })
  willExpire: boolean;
  @Prop({ type: Date, default: null })
  expiredAt: Date;
  @Prop({ type: Date, default: new Date() })
  createdAt: Date;
  @Prop({ type: Date, default: new Date() })
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
export const ClientModel = MongoModelBuilder(CLIENT_MODEL_NAME, ClientSchema);
