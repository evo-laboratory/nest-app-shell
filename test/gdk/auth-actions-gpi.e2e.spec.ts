import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { WinstonService } from '@shared/winston-logger';
import { ERROR_CODE } from '@shared/exceptions';
import {
  ACTIVATING_PATH,
  DEACTIVATING_PATH,
  GPI,
  SELF_PATH,
  V1,
} from '@shared/statics';

import { AuthService } from '@gdk-iam/auth/auth.service';
import { AUTH_API } from '@gdk-iam/auth/statics';
import { IEmailSignUp } from '@gdk-iam/auth/types';
import { AuthActivitiesService } from '@gdk-iam/auth-activities/auth-activities.service';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { MailService } from '@gdk-mail/mail.service';

import {
  BearerHeader,
  ClientKeyHeader,
  EmptyBearerHeader,
  TestSysOwnerData,
} from 'test/data';
import { TestModuleBuilderFixture } from 'test/fixtures';
import { TEST_VALID_MONGODB_OBJECT_ID } from 'test/helpers/js/static';

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
  let mailService: MailService;
  let authActivitiesService: AuthActivitiesService;
  let revokedTokenService: AuthRevokedTokenService;
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
    mailService = moduleFixture.get<MailService>(MailService);
    authService = moduleFixture.get<AuthService>(AuthService);
    authActivitiesService = moduleFixture.get<AuthActivitiesService>(
      AuthActivitiesService,
    );
    revokedTokenService = moduleFixture.get<AuthRevokedTokenService>(
      AuthRevokedTokenService,
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
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
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
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
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
      expect(res.body.data.isActivated).toBe(true);
    });
  });
  const DEACTIVATE_GPI = `${TARGET_PATH}/${DEACTIVATING_PATH}`;
  describe(`[PATCH] ${DEACTIVATE_GPI}/:id`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Not pass in id, should return 404`, () => {
      return request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(404);
    });
    it('Pass in invalid id, should return 403', () => {
      return request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}/invalid_id`)
        .set(ClientKeyHeader())
        .set(BearerHeader(generalUserAccessToken))
        .expect(403);
    });
    it(`Pass in Identifier verified and inactivated Auth, should return 400 with ${ERROR_CODE.AUTH_ALREADY_DEACTIVATED}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
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
        .patch(`${DEACTIVATE_GPI}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken));
      expect(res.status).toBe(400);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_ALREADY_DEACTIVATED);
      expect(res.body.message).toBeDefined();
    });
    it(`Pass in Identifier verified and activated Auth, should return 200`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
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
      await authService.emailSignIn({
        email: DTO.email,
        password: DTO.password,
      });
      const res = await request(app.getHttpServer())
        .patch(`${DEACTIVATE_GPI}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(`${res.body.data._id}`).toBe(`${auth.data._id}`);
      expect(res.body.data.isActivated).toBe(false);
      // * Validate auth activities
      const activities = await authActivitiesService.getByAuthId(
        `${auth.data._id}`,
      );
      expect(activities.accessTokenList.length).toEqual(1);
      expect(activities.refreshTokenList.length).toEqual(0);
      // * Validate revoked tokens
      const revokedTokens = await revokedTokenService.listByAuthId(
        `${auth.data._id}`,
      );
      expect(revokedTokens.length).toEqual(1);
    });
  });
  const SELF_DELETE_API = `${TARGET_PATH}/${SELF_PATH}`;
  describe(`[DELETE] ${SELF_DELETE_API}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .delete(`${SELF_DELETE_API}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${SELF_DELETE_API}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${SELF_DELETE_API}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('Should delete the auth and user pass in the correct token', async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
      // * Simulate sign up
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, true);
      const { accessToken } = await authService.emailSignIn({
        email: DTO.email,
        password: DTO.password,
      });
      const res = await request(app.getHttpServer())
        .delete(`${SELF_DELETE_API}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(accessToken));
      expect(res.status).toBe(200);
      // * Validate auth activities
      const activities = await authActivitiesService.getByAuthId(
        `${res.body.data._id}`,
      );
      expect(activities).toBeNull();
      expect(activities).toBeNull();
      // * Validate revoked tokens
      const revokedTokens = await revokedTokenService.listByAuthId(
        `${res.body.data._id}`,
      );
      expect(revokedTokens.length).toEqual(1);
    });
  });
  const DELETE_API = `${TARGET_PATH}`;
  describe(`[DELETE] ${DELETE_API}/:id`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Not pass id params, should return 404`, () => {
      return request(app.getHttpServer())
        .delete(`${DELETE_API}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .expect(404);
    });
    it('Should delete the auth and user pass in id params', async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
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
        .delete(`${DELETE_API}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken));
      expect(res.status).toBe(200);
      // * Validate auth activities
      const activities = await authActivitiesService.getByAuthId(
        `${res.body.data._id}`,
      );
      expect(activities).toBeNull();
      expect(activities).toBeNull();
      // * Validate revoked tokens
      const revokedTokens = await revokedTokenService.listByAuthId(
        `${res.body.data._id}`,
      );
      expect(revokedTokens.length).toEqual(0);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
