import { HTTP_METHOD } from '@gdk-system/enums';
import { HTTP_ENDPOINT_MODEL_NAME } from '@gdk-system/statics';
import { IHttpEndpoint } from '@gdk-system/types';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';
import { EnumToArray } from '@shared/helper';

export class HttpEndpoint implements IHttpEndpoint {
  @Prop({
    type: String,
    enum: EnumToArray(HTTP_METHOD),
    default: HTTP_METHOD.GET,
  })
  method: HTTP_METHOD;
  @Prop({ type: String, default: '' })
  path: string;
  @Prop({ type: String, default: '' })
  permissionId: string;
  @Prop({ type: String, default: '' })
  operationId: string;
  @Prop({ type: Object, default: {} })
  meta: any;
}

export const HttpEndpointSchema = SchemaFactory.createForClass(HttpEndpoint);
export const HttpEndpointModel = MongoModelBuilder(
  HTTP_ENDPOINT_MODEL_NAME,
  HttpEndpointSchema,
);
