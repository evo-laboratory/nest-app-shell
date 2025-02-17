import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from '@gdk-iam/auth/auth.service';
import {
  ACCESS_TOKEN_PATH,
  AUTH_API,
  REFRESH_TOKEN_PATH,
  REVOKE_REFRESH_TOKEN_PATH,
  SIGN_OUT_PATH,
} from '@gdk-iam/auth/statics';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

import {
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  TestSysOwnerData,
} from 'test/data';
import { WinstonService } from '@shared/winston-logger';
import { CHECK_PATH, GPI, V1 } from '@shared/statics';

import { TestModuleBuilderFixture } from 'test/fixtures';
import { TEST_VALID_JWT_TOKEN } from 'test/helpers/js/static';
import { AuthActivitiesService } from '@gdk-iam/auth-activities/auth-activities.service';
import { MailService } from '@gdk-mail/mail.service';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { IEmailSignUp } from '@gdk-iam/auth/types';

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
  let authActivitiesService: AuthActivitiesService;
  let mailService: MailService;
  let authRevokedTokenService: AuthRevokedTokenService;
  let sysOwnerAccessToken: string;
  let generalUserAccessToken: string;
  let generalUserRefreshToken: string;
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
    authService = moduleFixture.get<AuthService>(AuthService);
    authRevokedTokenService = moduleFixture.get<AuthRevokedTokenService>(
      AuthRevokedTokenService,
    );
    mailService = moduleFixture.get<MailService>(MailService);
    authActivitiesService = moduleFixture.get<AuthActivitiesService>(
      AuthActivitiesService,
    );
    // * STEP 2. Create a system owner for Authorization
    const TestOwner = TestSysOwnerData(`${process.env.SYS_OWNER_EMAIL}`);
    const { accessToken } = await authService.emailSignIn({
      email: TestOwner.email,
      password: TestOwner.password,
    });
    sysOwnerAccessToken = accessToken;
    // * STEP 3. Create a general user for Authorization
    await authService.emailSignUp(TEST_USER01, true);
    const { accessToken: generalUserToken, refreshToken } =
      await authService.emailSignIn({
        email: JESTER01_EMAIL,
        password: TEST_USER01.password,
      });
    generalUserAccessToken = generalUserToken;
    generalUserRefreshToken = refreshToken;
  });
  // * --- TEST CASES ----------
  const EXCHANGE_ACCESS_TOKEN_PATH = `${TARGET_PATH}/${ACCESS_TOKEN_PATH}`;
  describe(`[POST] ${EXCHANGE_ACCESS_TOKEN_PATH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it(`BearerHeader, but empty dto should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .send({})
        .expect(400);
    });
    it(`BearerHeader, invalid dto (token not refresh token) should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: generalUserAccessToken,
        })
        .expect(401);
    });
    it(`BearerHeader, invalid access token should return 201`, () => {
      return request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(TEST_VALID_JWT_TOKEN))
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: generalUserRefreshToken,
        })
        .expect(201);
    });
    it(`BearerHeader, valid dto should return 201`, async () => {
      const authActivity = jest.spyOn(
        authActivitiesService,
        'pushTokenItemByAuthId',
      );
      const res = await request(app.getHttpServer())
        .post(`${EXCHANGE_ACCESS_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: generalUserRefreshToken,
        });
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeUndefined();
      // * Valid auth activities
      expect(authActivity).toBeCalledTimes(1);
    });
  });
  const CHECK_REFRESH_TOKEN_PATH = `${TARGET_PATH}/${CHECK_PATH}/${REFRESH_TOKEN_PATH}`;
  describe(`[POST] ${CHECK_REFRESH_TOKEN_PATH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it(`BearerHeader, but empty dto should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .send({})
        .expect(400);
    });
    it(`EmptyBearerHeader, invalid dto (token not refresh token) should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: generalUserAccessToken,
        })
        .expect(401);
    });
    it(`EmptyBearerHeader, valid dto should return 201`, async () => {
      const res = await request(app.getHttpServer())
        .post(`${CHECK_REFRESH_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: generalUserRefreshToken,
        });
      expect(res.status).toBe(201);
      expect(res.body.isValid).toBe(true);
      expect(res.body.message).toBeDefined();
    });
  });
  const SELF_SIGN_OUT_PATH = `${TARGET_PATH}/${SIGN_OUT_PATH}`;
  describe(`[POST] ${SELF_SIGN_OUT_PATH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Invalid dto(empty), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(400);
    });
    it(`Invalid dto(type is ${AUTH_TOKEN_TYPE.ACCESS}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          type: AUTH_TOKEN_TYPE.ACCESS,
          token: TEST_VALID_JWT_TOKEN,
        })
        .expect(400);
    });
    it(`Valid dto(type is ${AUTH_TOKEN_TYPE.REFRESH}), should return 202`, async () => {
      // * Simulate new sign up
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, true);
      const { accessToken, refreshToken } = await authService.emailSignIn({
        email: DTO.email,
        password: DTO.password,
      });
      const res = await request(app.getHttpServer())
        .post(`${SELF_SIGN_OUT_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(accessToken))
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: refreshToken,
        });
      mailMock.mockRestore();
      expect(res.status).toBe(202);
      // * Check if the refresh token is revoked
      const check = await authService.verifyRefreshToken(
        {
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: refreshToken,
        },
        true,
      );
      expect(check.isValid).toBe(false);
      expect(check.message).toBe('Revoked token');
    });
  });
  const ADMIN_REVOKE_TOKEN_PATH = `${TARGET_PATH}/${REVOKE_REFRESH_TOKEN_PATH}`;
  describe(`[POST] ${ADMIN_REVOKE_TOKEN_PATH}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Invalid dto(empty), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(400);
    });
    it(`Invalid dto(type is ${AUTH_TOKEN_TYPE.ACCESS}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          type: AUTH_TOKEN_TYPE.ACCESS,
          token: TEST_VALID_JWT_TOKEN,
        })
        .expect(400);
    });
    it(`Valid dto(type is ${AUTH_TOKEN_TYPE.REFRESH}), should return 202`, async () => {
      // * Simulate new sign up
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, true);
      const { refreshToken } = await authService.emailSignIn({
        email: DTO.email,
        password: DTO.password,
      });
      const res = await request(app.getHttpServer())
        .post(`${ADMIN_REVOKE_TOKEN_PATH}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: refreshToken,
        });
      mailMock.mockRestore();
      expect(res.status).toBe(202);
      // * Check if the refresh token is revoked
      const check = await authService.verifyRefreshToken(
        {
          type: AUTH_TOKEN_TYPE.REFRESH,
          token: refreshToken,
        },
        true,
      );
      expect(check.isValid).toBe(false);
      expect(check.message).toBe('Revoked token');
    });
  });
  // const GET_TEST_CASE = `${TARGET_PATH}/${'?'}`;
  // describe(`[GET] ${GET_TEST_CASE}`, () => {
  //   it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
  //     return request(app.getHttpServer()).get(`${GET_TEST_CASE}`).expect(403);
  //   });
  //   it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
  //     return request(app.getHttpServer())
  //       .get(`${GET_TEST_CASE}`)
  //       .set(ClientKeyHeader())
  //       .expect(401);
  //   });
  //   it(`EmptyBearerHeader, should return 401`, () => {
  //     return request(app.getHttpServer())
  //       .get(`${GET_TEST_CASE}`)
  //       .set(ClientKeyHeader())
  //       .set(EmptyBearerHeader())
  //       .expect(401);
  //   });
  // });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
