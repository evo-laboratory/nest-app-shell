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
  @Prop({ type: String, default: '' })
  secret: string;
  @Prop({ type: Boolean, default: true })
  willExpire: boolean;
  @Prop({ type: Number, default: 0 })
  expiredAt: number;
  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
  @Prop({ type: Number, default: Date.now() })
  updatedAt: number;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
export const ClientModel = MongoModelBuilder(CLIENT_MODEL_NAME, ClientSchema);
