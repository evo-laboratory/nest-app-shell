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
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  MONGO_E2E_TEST_DB,
  TEST_CLIENT_ID,
  TEST_GENERAL_ROLE,
  TEST_SUPER_ROLE,
  TestSysOwnerData,
} from 'test/data';
import { WinstonService } from '@shared/winston-logger';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { SystemService } from '@gdk-system/system.service';
import { ROLE_SET_METHOD } from '@gdk-system/enums';

describe('GDK/SystemController', () => {
  const SYS_API = `/${GPI}/${SYSTEM_API}`;
  const SYE_RESOURCE_V1_PATH = `${SYS_API}/${V1}`;
  let app: INestApplication;
  let DBTestHelper: DatabaseTestHelper;
  let authService: AuthService;
  let systemService: SystemService;
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
    systemService = moduleFixture.get<SystemService>(SystemService);
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
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${PUBLIC_ENV_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${PUBLIC_ENV_API}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200);
    });
  });
  describe(`[GET] ${SYE_RESOURCE_V1_PATH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${SYE_RESOURCE_V1_PATH}`)
        .expect(403);
    });
    it(`Included: ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${SYE_RESOURCE_V1_PATH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${SYE_RESOURCE_V1_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${SYE_RESOURCE_V1_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.roles).toBeDefined();
          expect(res.body.rolesUpdatedAt).toBeDefined();
          expect(res.body.endpoints).toBeDefined();
          expect(res.body.endpointUpdatedAt).toBeDefined();
          expect(res.body.clients).toBeDefined();
          expect(res.body.newSignUpDefaultUserRole).toBeDefined();
          expect(res.body.clientUpdatedAt).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });
  });
  const SYNC_HTTP_ENDPOINTS_API = `${SYS_API}/${V1}/${SYNC_HTTP_ENDPOINTS_PATH}`;
  describe(`[PUT] ${SYNC_HTTP_ENDPOINTS_API}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .expect(403);
    });
    it(`Included ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', async () => {
      const res = await request(app.getHttpServer())
        .put(`${SYNC_HTTP_ENDPOINTS_API}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.roles).toBeDefined();
      expect(res.body.roles.length).toBeGreaterThan(0);
      expect(res.body.rolesUpdatedAt).toBeDefined();
      expect(res.body.endpoints).toBeDefined();
      expect(res.body.endpoints.length).toBeGreaterThan(0);
      expect(res.body.endpointUpdatedAt).toBeDefined();
      expect(res.body.clients).toBeDefined();
      expect(res.body.clients.length).toBeGreaterThan(0);
      expect(res.body.newSignUpDefaultUserRole).toBeDefined();
      expect(res.body.clientUpdatedAt).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });
  });
  describe(`[PUT] ${SYE_RESOURCE_V1_PATH}/{ID}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME} by default, should return 403`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .send({})
        .expect(403);
    });
    it(`Included ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .send({})
        .expect(401);
    });
    it(`EmptyBearHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({})
        .expect(401);
    });
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('BearerHeader (system-owner), but id(1234) not a valid ObjectId  should return 500', () => {
        return request(app.getHttpServer())
          .put(`${SYE_RESOURCE_V1_PATH}/1234`)
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({})
          .expect(500);
      });
    }
    it('BearerHeader (system-owner), but id(66a265d9e0e615ee831b5f1c) not exist should return 404', () => {
      return request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/66a265d9e0e615ee831b5f1c`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(404);
    });
    it('BearerHeader (system-owner), with exist id should return 200', async () => {
      const existId = await systemService.findOne();
      const res = await request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/${existId._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
    });
    it('BearerHeader (system-owner), with exist id but not valid dto prop, should return 200', async () => {
      const existSys = await systemService.findOne();
      const res = await request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/${existSys._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          notValidProp: 'notValidProp',
        });
      expect(res.status).toBe(200);
    });
    it('BearerHeader (system-owner), should update and return 200', async () => {
      const existSys = await systemService.findOne();
      const rolesUpdate = [
        {
          name: TEST_SUPER_ROLE,
          setMethod: ROLE_SET_METHOD.BLACK_LIST,
          endpointPermissions: [],
          description: 'Super Admin Role',
        },
        {
          name: TEST_GENERAL_ROLE,
          setMethod: ROLE_SET_METHOD.WHITE_LIST,
          endpointPermissions: [],
          description: 'Super Admin Role',
        },
        {
          name: 'NEW_ROLE',
          setMethod: ROLE_SET_METHOD.WHITE_LIST,
          endpointPermissions: [],
          description: 'New Role',
        },
      ];
      const clientsUpdate = [
        {
          id: TEST_CLIENT_ID,
          name: 'test-runner',
          willExpire: false,
          expiredAt: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'new-client-id',
          name: 'test-case-runner',
          willExpire: true,
          expiredAt: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      const res = await request(app.getHttpServer())
        .put(`${SYE_RESOURCE_V1_PATH}/${existSys._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          roles: rolesUpdate,
          clients: clientsUpdate,
          newSignUpDefaultUserRole: 'NEW_ROLE',
        });
      const updated = await systemService.findOne();
      expect(res.status).toBe(200);
      expect(updated.roles.length).toBe(3);
      expect(updated.clients.length).toBe(2);
      expect(updated.newSignUpDefaultUserRole).toBe('NEW_ROLE');
    });
  });
  afterAll(async () => {
    await DBTestHelper.clearDatabase();
    await DBTestHelper.disconnect();
    await app.close();
  });
});
