import { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModuleBuilderFixture } from 'test/fixtures';
import { GPI, V1 } from '@shared/statics';
import { ENV_PATH, SYSTEM_API } from '@gdk-system/statics';

describe('GDK/SystemController', () => {
  const SYS_API = `/${GPI}/${SYSTEM_API}`;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await TestModuleBuilderFixture();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });
  const PUBLIC_ENV_API = `${SYS_API}/${V1}/${ENV_PATH}`;
  describe(`[GET] ${PUBLIC_ENV_API}`, () => {
    it('Should be protected, return 403', () => {
      return request(app.getHttpServer()).get(`${PUBLIC_ENV_API}`).expect(403);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
