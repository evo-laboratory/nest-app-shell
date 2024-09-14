// * GDK Application Shell Default File
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ISwaggerSetupOption } from './swagger.type';

export const SWAGGER_DEFAULT_TITLE = 'NestJS Starter';
export const SWAGGER_DEFAULT_DESC = 'NestJS API Starter';
export const SWAGGER_DEFAULT_VER = '1.0';

function SwaggerDocumentBuilder(
  app: INestApplication,
  option?: ISwaggerSetupOption,
): OpenAPIObject {
  const swaggerDoc = new DocumentBuilder()
    .setTitle(option?.title || SWAGGER_DEFAULT_TITLE)
    .setDescription(option?.description || SWAGGER_DEFAULT_DESC)
    .setVersion(option?.version || SWAGGER_DEFAULT_VER)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerDoc);
  return document;
}

export default SwaggerDocumentBuilder;
