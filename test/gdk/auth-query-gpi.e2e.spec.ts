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
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { UserService } from '@gdk-iam/user/user.service';
import { AUTH_API } from '@gdk-iam/auth/statics';
import e from 'express';

describe('GDK/AuthController', () => {
  const CONTROLLER_ENDPOINT = `/${GPI}/${AUTH_API}`;
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
  const LIST_API = `${TARGET_PATH}/${LIST_PATH}`;
  describe(`[GET] ${LIST_API}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer()).get(`${LIST_API}`).expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${LIST_API}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${LIST_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${LIST_API}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
        });
    });
    it('Query with field selections (positive)', async () => {
      // * Below should be one of the fields in the IAuth
      const positiveSelect = [
        'identifier',
        'identifierType',
        'userId',
        'createdAt',
      ];
      const res = await request(app.getHttpServer())
        .get(`${LIST_API}`)
        .query({ fieldSelection: positiveSelect.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const fstData = res.body.data[0];
      Object.keys(fstData).forEach((key) => {
        expect(fstData[key]).toBeDefined();
      });
      // * Expecting the length of the object to be the same as the positiveSelect, + 1 for the _id
      expect(Object.keys(fstData).length).toBe(positiveSelect.length + 1);
    });
    it('Query with field selections (negative)', async () => {
      // * Below should be one of the fields in the IAuth
      const negativeSelection = [
        '-identifier',
        '-identifierType',
        '-userId',
        '-createdAt',
      ];
      const res = await request(app.getHttpServer())
        .get(`${LIST_API}`)
        .query({ fieldSelection: negativeSelection.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const fstData = res.body.data[0];
      negativeSelection.forEach((key) => {
        expect(fstData[key.replace('-', '')]).not.toBeDefined();
      });
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
