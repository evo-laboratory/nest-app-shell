import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { WinstonService } from '@shared/winston-logger';
import {
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  TestSysOwnerData,
} from 'test/data';
import { ERROR_CODE } from '@shared/exceptions';
import { TestModuleBuilderFixture } from 'test/fixtures';
import {
  TEST_GENERAL_ROLE,
  TEST_GENERAL_TWO_ROLE,
  TEST_SUPER_ROLE,
  TEST_VALID_MONGODB_OBJECT_ID,
} from 'test/helpers/js/static';
import { GPI, V1 } from '@shared/statics';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { UserService } from '@gdk-iam/user/user.service';

describe('GDK/{Rename}Controller', () => {
  const CONTROLLER_ENDPOINT = `/${GPI}/${'?'}`;
  const TARGET_PATH = `${CONTROLLER_ENDPOINT}/${V1}`;
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
    userService = moduleFixture.get<UserService>(UserService);
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
  // * --- TEST CASES ----------
  const POST_TEST_CASE_PAH = `${TARGET_PATH}/${'?'}`;
  describe(`[POST] ${POST_TEST_CASE_PAH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${POST_TEST_CASE_PAH}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${POST_TEST_CASE_PAH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${POST_TEST_CASE_PAH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
  });
  const GET_TEST_CASE = `${TARGET_PATH}/${'?'}`;
  describe(`[GET] ${GET_TEST_CASE}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer()).get(`${GET_TEST_CASE}`).expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_TEST_CASE}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_TEST_CASE}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
  });
  const PATCH_TEST_CASE = `${TARGET_PATH}/${'?'}`;
  describe(`[PATCH] ${PATCH_TEST_CASE}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .patch(`${PATCH_TEST_CASE}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${PATCH_TEST_CASE}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${PATCH_TEST_CASE}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
  });
  const DELETE_TEST_CASE_PAH = `${TARGET_PATH}/${'?'}`;
  describe(`[DELETE] ${DELETE_TEST_CASE_PAH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_TEST_CASE_PAH}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_TEST_CASE_PAH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_TEST_CASE_PAH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
