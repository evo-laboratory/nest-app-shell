import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import SwaggerSetup, {
  SWAGGER_DEFAULT_TITLE,
} from '@shared/swagger/swagger.setup';
import WinstonLogger from '@shared/winston-logger/winston.logger';

import { AppModule } from './app.module';

const PORT = process.env.PORT || 3000;
const STAGE = process.env.STAGE || 'DEV';

async function Bootstrap() {
  const app = await NestFactory.create(AppModule);
  // * Setup Swagger
  SwaggerSetup(app, {
    title: process.env.APP_NAME || SWAGGER_DEFAULT_TITLE,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(PORT);
  WinstonLogger.info(`${STAGE}`, {
    contextName: 'Main',
    methodName: 'Stage',
  });
  WinstonLogger.info(`Server Listen on PORT: ${PORT}`, {
    contextName: 'Main',
    methodName: Bootstrap.name,
  });
}
Bootstrap();
