import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import SwaggerSetup from '@shared/swagger/swagger.setup';
import WinstonLogger from '@shared/winston-logger/winston.logger';

import { AppModule } from './app.module';
import { SWAGGER_DEFAULT_TITLE } from '@shared/swagger';

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
  app.enableCors();
  await app.listen(PORT);
  WinstonLogger.info(`${STAGE}`, {
    contextName: 'Main',
    methodName: 'Stage',
  });
  WinstonLogger.info(`Server Listen on PORT: ${PORT}`, {
    contextName: 'Main',
    methodName: Bootstrap.name,
  });
  if (process.env.STAGE !== 'DEV') {
    if (process.env.ENABLE_SWAGGER) {
      WinstonLogger.warn('Swagger is enable in non DEV stage', {
        contextName: 'Main',
        methodName: 'SwaggerSetup',
      });
    } else {
      WinstonLogger.info('Swagger is disabled in non DEV stage', {
        contextName: 'Main',
        methodName: 'SwaggerSetup',
      });
    }
  }
}
Bootstrap();
