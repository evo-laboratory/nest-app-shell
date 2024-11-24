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
import { AUTH_API, EMAIL_VERIFICATION_PATH } from '@gdk-iam/auth/statics';
import { AUTH_CODE_USAGE } from '@gdk-iam/auth/enums';

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
  const EMAIL_VERIFICATION_GPI = `${TARGET_PATH}/${EMAIL_VERIFICATION_PATH}`;
  describe(`[POST] ${EMAIL_VERIFICATION_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it(`Invalid AuthEmailVerificationDto (not email), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'email',
          usage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        })
        .expect(400);
    });
    it(`Invalid AuthEmailVerificationDto (usage ${AUTH_CODE_USAGE.NOT_SET}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: `${process.env.SYS_OWNER_EMAIL}`,
          usage: AUTH_CODE_USAGE.NOT_SET,
        })
        .expect(400);
    });
    it(`Invalid AuthEmailVerificationDto (usage ${AUTH_CODE_USAGE.CHANGE_PASSWORD}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: `${process.env.SYS_OWNER_EMAIL}`,
          usage: AUTH_CODE_USAGE.CHANGE_PASSWORD,
        })
        .expect(400);
    });
    it(`Invalid AuthEmailVerificationDto (usage ${AUTH_CODE_USAGE.PHONE_VERIFY}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: `${process.env.SYS_OWNER_EMAIL}`,
          usage: AUTH_CODE_USAGE.PHONE_VERIFY,
        })
        .expect(400);
    });
    it(`Identifier not exist, should return 404 with ${ERROR_CODE.AUTH_NOT_FOUND}`, async () => {
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          usage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      expect(res.status).toBe(404);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_NOT_FOUND);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(404);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
