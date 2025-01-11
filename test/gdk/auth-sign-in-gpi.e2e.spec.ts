import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import { AuthService } from '@gdk-iam/auth/auth.service';
import { UserService } from '@gdk-iam/user/user.service';
import {
  AUTH_API,
  EMAIL_SIGN_IN_PATH,
  SOCIAL_SIGN_IN_UP_PATH,
} from '@gdk-iam/auth/statics';
import { IEmailSignUp } from '@gdk-iam/auth/types';
import { MailService } from '@gdk-mail/mail.service';
import { AuthActivitiesService } from '@gdk-iam/auth-activities/auth-activities.service';

import { WinstonService } from '@shared/winston-logger';
import { ERROR_CODE } from '@shared/exceptions';
import { GPI, V1 } from '@shared/statics';

import { TestModuleBuilderFixture } from 'test/fixtures';
import { ClientKeyHeader, EmptyBearerHeader } from 'test/data';

describe('GDK/AuthController', () => {
  const CONTROLLER_ENDPOINT = `/${GPI}/${AUTH_API}`;
  const TARGET_PATH = `${CONTROLLER_ENDPOINT}/${V1}`;
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let mailService: MailService;
  let authActivitiesService: AuthActivitiesService;
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
    mailService = moduleFixture.get<MailService>(MailService);
    authActivitiesService = moduleFixture.get<AuthActivitiesService>(
      AuthActivitiesService,
    );
  });
  // * --- TEST CASES ----------
  const EMAIL_SIGN_IN_GPI = `${TARGET_PATH}/${EMAIL_SIGN_IN_PATH}`;
  describe(`[POST] ${EMAIL_SIGN_IN_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it(`Invalid email (not email), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'not-email',
          password: '123456',
        })
        .expect(400);
    });
    it(`Invalid email (boolean), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: true,
          password: '123456',
        })
        .expect(400);
    });
    it(`Invalid email (number), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 1111,
          password: '123456',
        })
        .expect(400);
    });
    it(`Invalid email (object), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: { email: 'email@email.com' },
          password: '123456',
        })
        .expect(400);
    });
    it(`Invalid email (not exist), should return 400`, async () => {
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          password: '123456',
        });
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_NOT_FOUND);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(404);
    });
    it(`Invalid password (less than 6), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          password: '123',
        })
        .expect(400);
    });
    it(`Invalid password (boolean), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          password: false,
        })
        .expect(400);
    });
    it(`Invalid password (number), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          password: 12345678,
        })
        .expect(400);
    });
    it(`Invalid password (object), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: 'jester_should_not_found@user.com',
          password: { password: '12356788' },
        })
        .expect(400);
    });
    it(`Identifier not verified, should return 403 with ${ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED}`, async () => {
      const mock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
      await authService.emailSignUp(DTO, false);
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mock.mockRestore();
      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(403);
    });
    it(`Auth deactivated, should return 403 with ${ERROR_CODE.AUTH_INACTIVE}`, async () => {
      const mock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mock.mockRestore();
      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_INACTIVE);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(403);
    });
    it(`User not found (should not happen), should return 404 with ${ERROR_CODE.USER_NOT_FOUND}`, async () => {
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
      const userMock = jest
        .spyOn(userService, 'findByEmail')
        .mockImplementationOnce(() => {
          return null;
        });
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mailMock.mockRestore();
      userMock.mockRestore();
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(404);
    });
    it(`Invalid password, should return 403 with ${ERROR_CODE.AUTH_PASSWORD_INVALID}`, async () => {
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      mailMock.mockRestore();
      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_PASSWORD_INVALID);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(403);
      // * Validate auth activities
      const afterAuth = await authService.getByEmail(DTO.email, {}, false);
      const activities = await authActivitiesService.getByAuthId(
        `${afterAuth.data._id}`,
      );
      expect(activities.signInFailRecordList.length).toEqual(1);
    });
    it(`Invalid password with ${process.env['SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT']} times, should return 406 with ${ERROR_CODE.AUTH_SIGN_IN_FAILED_PER_HOUR_RATE_LIMIT}`, async () => {
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
      // * Simulate failed attempts of 5 times (match with SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT)
      await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: 'wrong_password1234',
        });
      const finalRes = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mailMock.mockRestore();
      expect(finalRes.status).toBe(406);
      expect(finalRes.body.errorCode).toBe(
        ERROR_CODE.AUTH_SIGN_IN_FAILED_PER_HOUR_RATE_LIMIT,
      );
      expect(finalRes.body.message).toBeDefined();
      expect(finalRes.body.statusCode).toBe(406);
      // * Validate auth activities
      const afterAuth = await authService.getByEmail(DTO.email, {}, false);
      const activities = await authActivitiesService.getByAuthId(
        `${afterAuth.data._id}`,
      );
      expect(activities.signInFailRecordList.length).toEqual(5);
    });
    it(`Valid email and password but auth activity not working (should not happened), should return 500 `, async () => {
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const activityMock = jest
        .spyOn(authActivitiesService, 'pushTokenItemByAuthId')
        .mockImplementationOnce(() => {
          return null;
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
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mailMock.mockRestore();
      activityMock.mockRestore();
      expect(res.status).toBe(500);
    });
    it(`Valid email and password, should return 200 with token`, async () => {
      const mailMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
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
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_IN_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .send({
          email: DTO.email,
          password: DTO.password,
        });
      mailMock.mockRestore();
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      const afterAuth = await authService.getByEmail(DTO.email, {}, false);
      const activities = await authActivitiesService.getByAuthId(
        `${afterAuth.data._id}`,
      );
      expect(activities.signInFailRecordList.length).toEqual(0);
      expect(activities.accessTokenList.length).toEqual(1);
      expect(activities.refreshTokenList.length).toEqual(1);
      expect(activities.lastIssueAccessTokenAt).toBeDefined();
      expect(activities.lastIssueRefreshTokenAt).toBeDefined();
    });
  });
  const SOCIAL_SIGN_IN_UP_GPI = `${TARGET_PATH}/${SOCIAL_SIGN_IN_UP_PATH}`;
  describe(`[POST] ${SOCIAL_SIGN_IN_UP_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${SOCIAL_SIGN_IN_UP_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${SOCIAL_SIGN_IN_UP_GPI}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${SOCIAL_SIGN_IN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
