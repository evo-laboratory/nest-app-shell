import { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModuleBuilderFixture } from 'test/fixtures';
import { GPI, V1 } from '@shared/statics';
import {
  ENV_PATH,
  SYNC_HTTP_ENDPOINTS_PATH,
  SYSTEM_API,
} from '@gdk-system/statics';
import { DatabaseTestHelper } from 'test/helpers';

describe('GDK/SystemController', () => {
  const SYS_API = `/${GPI}/${SYSTEM_API}`;
  const SYE_RESOURCE_V1_PATH = `${SYS_API}/${V1}`;
  let app: INestApplication;
  let DBTestHelper: DatabaseTestHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await TestModuleBuilderFixture();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    DBTestHelper = await DatabaseTestHelper.init(
      process.env.DATABASE_PROVIDER as 'MONGODB',
      process.env.MONGO_URI,
      'e2e-testing',
    );
    await DBTestHelper.setupSystem();
    await app.init();
  });
  const PUBLIC_ENV_API = `${SYS_API}/${V1}/${ENV_PATH}`;
  describe(`[GET] ${PUBLIC_ENV_API}`, () => {
    beforeAll(() => {
      console.log('SETUP SUPER ADMIN ROLE');
    });
    it('Guarded by default, should return 403', () => {
      return request(app.getHttpServer()).get(`${PUBLIC_ENV_API}`).expect(403);
    });
  });
  const SYNC_HTTP_ENDPOINTS_API = `${SYS_API}/${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`;
  describe(`[PUT] ${SYNC_HTTP_ENDPOINTS_API}`, () => {
    it('Guarded by default, should return 403', () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .expect(403);
    });
  });
  describe(`[PUT] ${SYE_RESOURCE_V1_PATH}/1234`, () => {
    it('Guarded by default, should return 403', () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .expect(403);
    });
  });
  afterAll(async () => {
    await DBTestHelper.clearDatabase();
    await DBTestHelper.disconnect();
    await app.close();
  });
});
