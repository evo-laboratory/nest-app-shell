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
import { ACTIVATING_PATH, GPI, V1 } from '@shared/statics';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { UserService } from '@gdk-iam/user/user.service';
import { AUTH_API } from '@gdk-iam/auth/statics';
import { IEmailSignUp } from '@gdk-iam/auth/types';

describe('GDK/{Rename}Controller', () => {
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
  const ACTIVATE_GPI = `${TARGET_PATH}/${ACTIVATING_PATH}`;
  describe(`[PATCH] ${ACTIVATE_GPI}/:id`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Not pass in id, should return 404`, () => {
      return request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(404);
    });
    it('Pass in invalid id, should return 403', () => {
      return request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/invalid_id`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .expect(403);
    });
    it(`Pass in Identifier verified and activated Auth, should return 400 with ${ERROR_CODE.AUTH_ALREADY_ACTIVATED}`, async () => {
      // * Simulate sign up
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, true);
      const auth = await authService.getByEmail(DTO.email, {}, false);
      const res = await request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken));
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_ALREADY_ACTIVATED);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(400);
    });
    it(`Pass in Identifier verified and inactivated Auth, should return 200`, async () => {
      // * Simulate sign up
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, true);
      const auth = await authService.getByEmail(DTO.email, {}, false);
      await authService.deactivateById(`${auth.data._id}`);
      const res = await request(app.getHttpServer())
        .patch(`${ACTIVATE_GPI}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(`${res.body.data._id}`).toBe(`${auth.data._id}`);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
