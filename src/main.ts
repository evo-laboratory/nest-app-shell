import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import SwaggerSetup from '@shared/swagger/swagger.setup';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { SWAGGER_DEFAULT_TITLE } from '@shared/swagger';
import { WinstonService } from '@shared/winston-logger';

import { AppModule } from './app.module';

const PORT = process.env.PORT || 3000;
const STAGE = process.env.STAGE || 'DEV';

async function Bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonService(),
  });
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
    methodName: 'EnvStage',
  });
  WinstonLogger.info(
    `${
      process.env.APP_NAME || 'Nest App Shell'
    } Server Listen on PORT: ${PORT}`,
    {
      contextName: 'Main',
      methodName: Bootstrap.name,
    },
  );
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
  WinstonLogger.verbose(`${process.env.CLIENT_KEY_NAME}`, {
    contextName: 'Main',
    methodName: 'CLIENT_KEY_NAME',
  });
  WinstonLogger.verbose(`${process.env.MONGO_DB_NAME}`, {
    contextName: 'Main',
    methodName: 'MONGO_DB_NAME',
  });
  const NODE_ENV = process.env.NODE_ENV
    ? `${process.env.NODE_ENV}`.toLowerCase()
    : 'dev';
  // * Using which env file is controlled by NODE_ENV, reference to app.module.ts
  WinstonLogger.info(
    `${
      process.env.NODE_ENV
        ? `${process.env.NODE_ENV}`.toLowerCase()
        : 'Not specific, using .env.dev'
    }`,
    {
      contextName: 'Main',
      methodName: 'envFilePath',
    },
  );
  WinstonLogger.verbose(`${NODE_ENV}`, {
    contextName: 'Main',
    methodName: 'NODE_ENV',
  });
}
Bootstrap();
