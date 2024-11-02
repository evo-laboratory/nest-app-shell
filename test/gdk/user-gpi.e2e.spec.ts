import * as request from 'supertest';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { USER_API } from '@gdk-iam/user/types';
import { UserService } from '@gdk-iam/user/user.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { WinstonService } from '@shared/winston-logger';
import { TestModuleBuilderFixture } from 'test/fixtures';
import {
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  TestSysOwnerData,
} from 'test/data';
import e from 'express';

describe('GDK/UserController', () => {
  const _USER_API = `/${GPI}/${USER_API}`;
  const USER_RESOURCE_V1_PATH = `${_USER_API}/${V1}`;
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let sysOwnerAccessToken: string;

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
  afterAll(async () => {
    await app.close();
  });
});
