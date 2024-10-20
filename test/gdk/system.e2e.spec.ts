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
import {
  BearHeader,
  ClientKeyHeader,
  EmptyBearHeader,
  MONGO_E2E_TEST_DB,
  TestSysOwnerData,
} from 'test/data';
import { WinstonService } from '@shared/winston-logger';
import { AuthService } from '@gdk-iam/auth/auth.service';

describe('GDK/SystemController', () => {
  const SYS_API = `/${GPI}/${SYSTEM_API}`;
  const SYE_RESOURCE_V1_PATH = `${SYS_API}/${V1}`;
  let app: INestApplication;
  let DBTestHelper: DatabaseTestHelper;
  let authService: AuthService;
  let sysOwnerAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await TestModuleBuilderFixture();
    app = moduleFixture.createNestApplication({
      logger: new WinstonService(),
    });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    DBTestHelper = await DatabaseTestHelper.init(
      process.env.DATABASE_PROVIDER as 'MONGODB',
      process.env.MONGO_URI,
      MONGO_E2E_TEST_DB,
    );
    await DBTestHelper.setupSystem();
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
  });
  const PUBLIC_ENV_API = `${SYS_API}/${V1}/${ENV_PATH}`;
  describe(`[GET] ${PUBLIC_ENV_API}`, () => {
    beforeAll(async () => {
      const TestOwner = TestSysOwnerData(`${process.env.SYS_OWNER_EMAIL}`);
      await authService.emailSignUp(TestOwner, true);
      const { accessToken } = await authService.emailSignIn({
        email: TestOwner.email,
        password: TestOwner.password,
      });
      sysOwnerAccessToken = accessToken;
    });
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer()).get(`${PUBLIC_ENV_API}`).expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${PUBLIC_ENV_API}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`Pass in empty bear header, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${PUBLIC_ENV_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearHeader())
        .expect(401);
    });
    it('Pass in valid bearer header (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${PUBLIC_ENV_API}`)
        .set(ClientKeyHeader())
        .set(BearHeader(sysOwnerAccessToken))
        .send({})
        .expect(200);
    });
  });
  const SYNC_HTTP_ENDPOINTS_API = `${SYS_API}/${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`;
  describe(`[PUT] ${SYNC_HTTP_ENDPOINTS_API}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`Pass in empty bearer header, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearHeader())
        .expect(401);
    });
    it('Pass in valid bearer header (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .set(BearHeader(sysOwnerAccessToken))
        .send({})
        .expect(200);
    });
  });
  describe(`[PUT] ${SYE_RESOURCE_V1_PATH}/1234`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .send({})
        .expect(401);
    });
    it(`Pass in empty bear header, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .set(EmptyBearHeader())
        .send({})
        .expect(401);
    });
  });
  afterAll(async () => {
    await DBTestHelper.clearDatabase();
    await DBTestHelper.disconnect();
    await app.close();
  });
});
