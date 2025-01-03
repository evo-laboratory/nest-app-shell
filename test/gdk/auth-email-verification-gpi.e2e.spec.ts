import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { AUTH_API, EMAIL_VERIFICATION_PATH } from '@gdk-iam/auth/statics';
import { AUTH_CODE_USAGE } from '@gdk-iam/auth/enums';
import { IEmailSignUp } from '@gdk-iam/auth/types';
import { MailService } from '@gdk-mail/mail.service';
import { WinstonService } from '@shared/winston-logger';
import { ERROR_CODE } from '@shared/exceptions';
import { GPI, V1 } from '@shared/statics';
import { MinToMilliseconds } from '@shared/helper';

import { ClientKeyHeader, EmptyBearerHeader } from 'test/data';
import { TestModuleBuilderFixture } from 'test/fixtures';

describe('GDK/AuthController', () => {
  const CONTROLLER_ENDPOINT = `/${GPI}/${AUTH_API}`;
  const TARGET_PATH = `${CONTROLLER_ENDPOINT}/${V1}`;
  let app: INestApplication;
  let authService: AuthService;
  let mailService: MailService;
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
    mailService = moduleFixture.get<MailService>(MailService);
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
    it(`Identifier already verified, should return 409 with ${ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED}`, async () => {
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
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      mock.mockRestore();
      expect(res.status).toBe(409);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(
        ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED,
      );
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(409);
    });
    it(`Just sign-up, cannot send again within CODE_EXPIRE_MIN. Should return 429 with ${ERROR_CODE.AUTH_CODE_EMAIL_RATE_LIMIT}`, async () => {
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
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      mock.mockRestore();
      expect(res.status).toBe(429);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_CODE_EMAIL_RATE_LIMIT);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(429);
      // * Validate the database state (AUTH)
      const authAfter = await authService.getByEmail(DTO.email, {}, false);
      expect(authAfter.data).toBeDefined();
      expect(authAfter.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
    });
    it(`Just sign-up, cannot process ${AUTH_CODE_USAGE.FORGOT_PASSWORD} because Identifier not verified. Return 403 with ${ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED}`, async () => {
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
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.FORGOT_PASSWORD,
        });
      mock.mockRestore();
      expect(res.status).toBe(403);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(403);
      // * Validate the database state (AUTH)
      const authAfter = await authService.getByEmail(DTO.email, {}, false);
      expect(authAfter.data).toBeDefined();
      expect(authAfter.data.isIdentifierVerified).toBe(false);
      expect(authAfter.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
    });
    it(`Auth already verified, using ${AUTH_CODE_USAGE.FORGOT_PASSWORD} (after ${process.env['CODE_EXPIRE_MIN']} min) with MailService error should return 500`, async () => {
      // * Please check your environment variable for CODE_EXPIRE_MIN, should be 1.
      const mock = jest
        .spyOn(mailService, 'send')
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
      // * Wait for CODE_EXPIRE_MIN
      await new Promise((resolve) => {
        setTimeout(
          resolve,
          MinToMilliseconds(process.env['CODE_EXPIRE_MIN']) + 50,
        );
      });
      const reMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.FORGOT_PASSWORD,
        });
      mock.mockRestore();
      reMock.mockRestore();
      expect(res.status).toBe(500);
      // * Validate the database state (AUTH)
      const authAfter = await authService.getByEmail(DTO.email, {}, false);
      expect(authAfter.data).toBeDefined();
      expect(authAfter.data.isIdentifierVerified).toBe(true);
      expect(authAfter.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(authAfter.data.code).toBeDefined();
      expect(authAfter.data.codeExpiredAt).toBeDefined();
    }, 90000);
    it(`Sign-up after ${process.env['CODE_EXPIRE_MIN']} min, using ${AUTH_CODE_USAGE.SIGN_UP_VERIFY} should return 202`, async () => {
      // * Please check your environment variable for CODE_EXPIRE_MIN, should be 1.
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
      // * Wait for CODE_EXPIRE_MIN
      await new Promise((resolve) => {
        setTimeout(
          resolve,
          MinToMilliseconds(process.env['CODE_EXPIRE_MIN']) + 50,
        );
      });
      const reMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      mock.mockRestore();
      reMock.mockRestore();
      expect(res.status).toBe(202);
      // * Validate the database state (AUTH)
      const authAfter = await authService.getByEmail(DTO.email, {}, false);
      expect(authAfter.data).toBeDefined();
      expect(authAfter.data.isIdentifierVerified).toBe(false);
      expect(authAfter.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(authAfter.data.code).toBeDefined();
      expect(authAfter.data.codeExpiredAt).toBeDefined();
    }, 90000);
    it(`Auth already verified, using ${AUTH_CODE_USAGE.FORGOT_PASSWORD} (after ${process.env['CODE_EXPIRE_MIN']} min) should return 202`, async () => {
      // * Please check your environment variable for CODE_EXPIRE_MIN, should be 1.
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
      // * Wait for CODE_EXPIRE_MIN
      await new Promise((resolve) => {
        setTimeout(
          resolve,
          MinToMilliseconds(process.env['CODE_EXPIRE_MIN']) + 50,
        );
      });
      const reMock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(() => {
          // * We are not testing the real mail service here, will test on MailController
          return Promise.resolve({ mailId: 'mailId', statusText: '202' });
        });
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: DTO.email,
          usage: AUTH_CODE_USAGE.FORGOT_PASSWORD,
        });
      mock.mockRestore();
      reMock.mockRestore();
      expect(res.status).toBe(202);
      // * Validate the database state (AUTH)
      const authAfter = await authService.getByEmail(DTO.email, {}, false);
      expect(authAfter.data).toBeDefined();
      expect(authAfter.data.isIdentifierVerified).toBe(true);
      expect(authAfter.data.codeUsage).toBe(AUTH_CODE_USAGE.FORGOT_PASSWORD);
      expect(authAfter.data.code).toBeDefined();
      expect(authAfter.data.codeExpiredAt).toBeDefined();
    }, 90000);
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
