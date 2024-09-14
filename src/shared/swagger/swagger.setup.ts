// * GDK Application Shell Default File
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ISwaggerSetupOption } from '@shared/swagger/swagger.type';
import SwaggerDocumentBuilder from './swagger-document-builder';

export const SWAGGER_DEFAULT_PATH = 'swagger';

function SwaggerSetup(app: INestApplication, option?: ISwaggerSetupOption) {
  const document = SwaggerDocumentBuilder(app, option);
  if (process.env.STAGE === 'DEV' || process.env.ENABLE_SWAGGER) {
    SwaggerModule.setup(option?.path || SWAGGER_DEFAULT_PATH, app, document);
  }
}

export default SwaggerSetup;
