import * as request from 'supertest';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { USER_API, USER_ROLE_LIST_PATH } from '@gdk-iam/user/types';
import { UserService } from '@gdk-iam/user/user.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { WinstonService } from '@shared/winston-logger';
import {
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  TEST_GENERAL_ROLE,
  TEST_SUPER_ROLE,
  TestSysOwnerData,
} from 'test/data';
import { ERROR_CODE } from '@shared/exceptions';
import { TestModuleBuilderFixture } from 'test/fixtures';

describe('GDK/UserController', () => {
  const _USER_API = `/${GPI}/${USER_API}`;
  const USER_RESOURCE_V1_PATH = `${_USER_API}/${V1}`;
  const JESTER01_EMAIL = `jester_${new Date().getTime()}@user.com`;
  const TEST_USER01 = {
    email: JESTER01_EMAIL,
    password: '123456',
    firstName: 'Jester',
    lastName: 'Automaticode',
    displayName: 'Jester Automaticode',
  };
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let sysOwnerAccessToken: string;
  let generalUserAccessToken: string;

  beforeAll(async () => {
    // * STEP 1. Setup the NestJS application Test Bed
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
    await app.init();
    userService = app.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    // * STEP 2. Create a system owner for Authorization
    const TestOwner = TestSysOwnerData(`${process.env.SYS_OWNER_EMAIL}`);
    const { accessToken } = await authService.emailSignIn({
      email: TestOwner.email,
      password: TestOwner.password,
    });
    sysOwnerAccessToken = accessToken;
    // * STEP 3. Create a general user for Authorization
    await authService.emailSignUp(TEST_USER01, true);
    const { accessToken: generalUserToken } = await authService.emailSignIn({
      email: JESTER01_EMAIL,
      password: TEST_USER01.password,
    });
    generalUserAccessToken = generalUserToken;
  });

  describe(`[GET] ${USER_RESOURCE_V1_PATH}/${LIST_PATH}`, () => {
    it(`ClientGuarded by default, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${LIST_PATH}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${LIST_PATH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
        });
    });
  });
  describe(`[GET] ${USER_RESOURCE_V1_PATH}/{ID}`, () => {
    it(`ClientGuarded by default, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/1234`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/1234`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('BearerHeader (system-owner), but id(1234) not a valid ObjectId  should return 500', () => {
        return request(app.getHttpServer())
          .get(`${USER_RESOURCE_V1_PATH}/1234`)
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({})
          .expect(400);
      });
    }
    it('BearerHeader (system-owner), but id(66a265d9e0e615ee831b5f1c) not exist should return 404', () => {
      return request(app.getHttpServer())
        .put(`${USER_RESOURCE_V1_PATH}/66a265d9e0e615ee831b5f1c`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(404);
    });
    it('BearerHeader (system-owner), with exist id should return 200', async () => {
      const existId = await userService.findByEmail(
        `${process.env.SYS_OWNER_EMAIL}`,
      );
      const res = await request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${existId._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.firstName).toBeDefined();
      expect(res.body.data.lastName).toBeDefined();
      expect(res.body.data.displayName).toBeDefined();
      expect(res.body.data.isEmailVerified).toBeDefined();
      expect(res.body.data.roleList).toBeInstanceOf(Array);
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
      expect(res.body.meta).toBeUndefined();
    });
  });
  describe(`[PATCH] ${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`, () => {
    it(`ClientGuarded by default, should return 403`, () => {
      return request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (general-user), should return 403', () => {
      return request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .send({})
        .expect(403);
    });
    it('BearerHeader (system-owner), non exist roleName should return 400', async () => {
      const generalUser = await userService.findByEmail(JESTER01_EMAIL);
      const res = await request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          userId: generalUser._id,
          roleName: 'FALSE',
        });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.ROLE_NOT_EXIST);
      expect(res.body.message).toBeDefined();
    });
    it('BearerHeader (system-owner), non exist userId(66a265d9e0e615ee831b5f1c) should return 404', async () => {
      const res = await request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          userId: '66a265d9e0e615ee831b5f1c',
          roleName: TEST_GENERAL_ROLE,
        });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(res.body.message).toBeDefined();
    });
    it(`BearerHeader (system-owner), should add role ${TEST_SUPER_ROLE}`, async () => {
      const generalUser = await userService.findByEmail(JESTER01_EMAIL);
      const res = await request(app.getHttpServer())
        .patch(`${USER_RESOURCE_V1_PATH}/${USER_ROLE_LIST_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          userId: generalUser._id,
          roleName: TEST_SUPER_ROLE,
        });
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.firstName).toBeDefined();
      expect(res.body.data.lastName).toBeDefined();
      expect(res.body.data.displayName).toBeDefined();
      expect(res.body.data.isEmailVerified).toBeDefined();
      expect(res.body.data.roleList).toBeInstanceOf(Array);
      expect(res.body.data.roleList).toContain(TEST_SUPER_ROLE);
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
