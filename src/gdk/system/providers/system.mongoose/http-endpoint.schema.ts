import { HTTP_METHOD } from '@gdk-system/enums';
import { HTTP_ENDPOINT_MODEL_NAME } from '@gdk-system/statics';
import { IHttpEndpoint } from '@gdk-system/types';
import { SchemaFactory } from '@nestjs/mongoose';
import { MongoModelBuilder } from '@shared/mongodb';

export class HttpEndpoint implements IHttpEndpoint {
  method: HTTP_METHOD;
  path: string;
  permissionId: string;
  operationId: string;
  meta: any;
}

export const HttpEndpointSchema = SchemaFactory.createForClass(HttpEndpoint);
export const HttpEndpointModel = MongoModelBuilder(
  HTTP_ENDPOINT_MODEL_NAME,
  HttpEndpointSchema,
);
