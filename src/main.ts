import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import SwaggerSetup from '@shared/swagger/swagger.setup';
import WinstonLogger from '@shared/winston-logger/winston.logger';

import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // * Setup Swagger
  SwaggerSetup(app);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(PORT);
  WinstonLogger.info(`Server Listen on PORT: ${PORT}`, {
    contextName: 'Main',
    methodName: bootstrap.name,
  });
}
bootstrap();
