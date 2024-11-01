import { TestingModule } from '@nestjs/testing';
import { TestModuleBuilderFixture } from './test-module-builder.fixture';
import { WinstonService } from '@shared/winston-logger';
import { ValidationPipe } from '@nestjs/common';

module.exports = async function (globalConfig, projectConfig) {
  console.info('Global setup....');
  // * STEP 1. Setup the NestJS application Test Bed
  const moduleFixture: TestingModule = await TestModuleBuilderFixture();
  globalThis.NEST_APP = moduleFixture.createNestApplication({
    logger: new WinstonService(),
  });
  globalThis.NEST_APP.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await globalThis.NEST_APP.init();
};
