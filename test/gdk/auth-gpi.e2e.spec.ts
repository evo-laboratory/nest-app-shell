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
import {
  ERROR_CODE,
  ERROR_SOURCE,
  UniteHttpException,
} from '@shared/exceptions';
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
import {
  AUTH_API,
  EMAIL_SIGN_UP_PATH,
  VERIFICATION_PATH,
  VERIFIED_EMAIL_SIGN_UP_PATH,
} from '@gdk-iam/auth/statics';
import { IEmailSignUp } from '@gdk-iam/auth/types';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_PROVIDER,
} from '@gdk-iam/auth/enums';
import { MailService } from '@gdk-mail/mail.service';

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
  let mailService: MailService;
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
    mailService = moduleFixture.get<MailService>(MailService);
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
  const EMAIL_SIGN_UP_GPI = `${TARGET_PATH}/${EMAIL_SIGN_UP_PATH}`;
  describe(`[POST] ${EMAIL_SIGN_UP_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (not email), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'email',
          password: `123456`,
          firstName: 'fstName',
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (password too short), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'email',
          password: `12345`,
          firstName: 'fstName',
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (firstName is boolean), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'jester_should_not_created@user.com',
          password: `123456`,
          firstName: true,
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (lastName is number), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send({
          email: 'jester_should_not_created@user.com',
          password: `123456`,
          firstName: 'fstName',
          lastName: 99999,
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Existed user/auth email, should return 400 and ${ERROR_CODE.AUTH_EMAIL_EXIST}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      await authService.emailSignUp(DTO, false);
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send(DTO);
      expect(res.status).toBe(400);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_EMAIL_EXIST);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(400);
    });
    it(`Existed only auth email (not supposed to happen), should return 400 and ${ERROR_CODE.AUTH_IDENTIFIER_EXIST}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      // * Normal user sign-up process
      await authService.emailSignUp(DTO, false);
      // * Find and delete the user
      const auth = await authService.getByEmail(DTO.email, {}, false);
      await userService.deleteById(`${auth.data.userId}`);
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send(DTO);
      expect(res.status).toBe(400);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_IDENTIFIER_EXIST);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(400);
    });
    it(`Failed mail service (not supposed to happen), should return 500 and ${ERROR_CODE.MAIL_PROVIDER_FAILED}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.reject(
          new UniteHttpException({
            source: ERROR_SOURCE.SENDGRID_MAIL,
            errorCode: ERROR_CODE.MAIL_PROVIDER_FAILED,
            message: 'Test error message',
            statusCode: 500,
            contextName: 'MailSendgridService',
            methodName: 'send',
          }),
        );
      });
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send(DTO);
      expect(res.status).toBe(500);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.MAIL_PROVIDER_FAILED);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(500);
      // * Validate the database state (USER)
      const user = await userService.findByEmail(DTO.email);
      expect(user).toBeNull();
      // * Validate the database state (AUTH)
      const auth = await authService.getByEmail(DTO.email, {}, true);
      expect(auth.data).toBeNull();
    });
    it(`Valid EmailSignUpDto, should return 201 and validate database state`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send(DTO);
      expect(res.status).toBe(201);
      expect(res.body.email).toBe(DTO.email);
      expect(res.body.isEmailSent).toBe(true);
      expect(res.body.canResendAt).toBeDefined();
      expect(res.body.provider).toBeDefined();
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(res.body.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(res.body.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      }
      // * Validate the database state (USER)
      const user = await userService.findByEmail(DTO.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(DTO.email);
      expect(user.firstName).toBe(DTO.firstName);
      expect(user.lastName).toBe(DTO.lastName);
      expect(user.displayName).toBe(DTO.displayName);
      expect(user.isEmailVerified).toBe(false);
      expect(user.isSelfDeleted).toBe(false);
      expect(user.backupAuth).toBe(null);
      expect(user.selfDeletedAt).toBe(null);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // * Validate the database state (AUTH)
      const auth = await authService.getByEmail(DTO.email, {}, false);
      expect(auth).toBeDefined();
      expect(auth.data.identifier).toBe(DTO.email);
      expect(auth.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(auth.data.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(auth.data.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [AUTH STATE]',
        );
      }
      expect(`${auth.data.userId}`).toEqual(`${user._id}`);
      expect(auth.data.googleSignInId).toBeDefined();
      expect(auth.data.appleSignInId).toBeDefined();
      expect(auth.data.facebookSignId).toBeDefined();
      expect(auth.data.githubSignId).toBeDefined();
      expect(auth.data.gitlabSignId).toBeDefined();
      expect(auth.data.microsoftSignId).toBeDefined();
      expect(auth.data.password).toBeDefined();
      expect(auth.data.code).toBeDefined();
      expect(auth.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(auth.data.codeExpiredAt).toBeDefined();
      expect(auth.data.isIdentifierVerified).toBe(false);
      expect(auth.data.isActivated).toBe(true);
      expect(auth.data.inactivatedAt).toBe(null);
      expect(auth.data.createdAt).toBeDefined();
      expect(auth.data.updatedAt).toBeDefined();
      expect(auth.data.lastChangedPasswordAt).toBe(null);
    });
    it(`Valid EmailSignUpDto (empty displayName), should return 201 and validate database state`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: '',
      };
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .send(DTO);
      expect(res.status).toBe(201);
      expect(res.body.email).toBe(DTO.email);
      expect(res.body.isEmailSent).toBe(true);
      expect(res.body.canResendAt).toBeDefined();
      expect(res.body.provider).toBeDefined();
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(res.body.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(res.body.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      }
      // * Validate the database state (USER)
      const user = await userService.findByEmail(DTO.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(DTO.email);
      expect(user.firstName).toBe(DTO.firstName);
      expect(user.lastName).toBe(DTO.lastName);
      expect(user.displayName).toBe(`${DTO.firstName} ${DTO.lastName}`);
      expect(user.isEmailVerified).toBe(false);
      expect(user.isSelfDeleted).toBe(false);
      expect(user.backupAuth).toBe(null);
      expect(user.selfDeletedAt).toBe(null);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // * Validate the database state (AUTH)
      const auth = await authService.getByEmail(DTO.email, {}, false);
      expect(auth).toBeDefined();
      expect(auth.data.identifier).toBe(DTO.email);
      expect(auth.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(auth.data.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(auth.data.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [AUTH STATE]',
        );
      }
      expect(`${auth.data.userId}`).toEqual(`${user._id}`);
      expect(auth.data.googleSignInId).toBeDefined();
      expect(auth.data.appleSignInId).toBeDefined();
      expect(auth.data.facebookSignId).toBeDefined();
      expect(auth.data.githubSignId).toBeDefined();
      expect(auth.data.gitlabSignId).toBeDefined();
      expect(auth.data.microsoftSignId).toBeDefined();
      expect(auth.data.password).toBeDefined();
      expect(auth.data.code).toBeDefined();
      expect(auth.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(auth.data.codeExpiredAt).toBeDefined();
      expect(auth.data.isIdentifierVerified).toBe(false);
      expect(auth.data.isActivated).toBe(true);
      expect(auth.data.inactivatedAt).toBe(null);
      expect(auth.data.createdAt).toBeDefined();
      expect(auth.data.updatedAt).toBeDefined();
      expect(auth.data.lastChangedPasswordAt).toBe(null);
    });
  });
  const VERIFIED_EMAIL_SIGN_UP_GPI = `${TARGET_PATH}/${VERIFIED_EMAIL_SIGN_UP_PATH}`;
  describe(`[POST] ${VERIFIED_EMAIL_SIGN_UP_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Invalid EmailSignUpDto (not email), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          email: 'email',
          password: `123456`,
          firstName: 'fstName',
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (password too short), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          email: 'email',
          password: `12345`,
          firstName: 'fstName',
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (firstName is boolean), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          email: 'jester_should_not_created@user.com',
          password: `123456`,
          firstName: true,
          lastName: 'lstName',
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Invalid EmailSignUpDto (lastName is number), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({
          email: 'jester_should_not_created@user.com',
          password: `123456`,
          firstName: 'fstName',
          lastName: 99999,
          displayName: 'displayName',
        })
        .expect(400);
    });
    it(`Existed user/auth email, should return 400 and ${ERROR_CODE.AUTH_EMAIL_EXIST}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      await authService.emailSignUp(DTO, false);
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send(DTO);
      expect(res.status).toBe(400);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_EMAIL_EXIST);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(400);
    });
    it(`Existed only auth email (not supposed to happen), should return 400 and ${ERROR_CODE.AUTH_IDENTIFIER_EXIST}`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      // * Normal user sign-up process
      await authService.emailSignUp(DTO, false);
      // * Find and delete the user
      const auth = await authService.getByEmail(DTO.email, {}, false);
      await userService.deleteById(`${auth.data.userId}`);
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send(DTO);
      expect(res.status).toBe(400);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_IDENTIFIER_EXIST);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(400);
    });
    it(`Valid EmailSignUpDto, should return 201 and validate database state`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send(DTO);
      expect(res.status).toBe(201);
      expect(res.body.email).toBe(DTO.email);
      expect(res.body.isEmailSent).toBe(false);
      expect(res.body.canResendAt).toBeDefined();
      expect(res.body.provider).toBeDefined();
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(res.body.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(res.body.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      }
      // * Validate the database state (USER)
      const user = await userService.findByEmail(DTO.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(DTO.email);
      expect(user.firstName).toBe(DTO.firstName);
      expect(user.lastName).toBe(DTO.lastName);
      expect(user.displayName).toBe(DTO.displayName);
      expect(user.isEmailVerified).toBe(true);
      expect(user.isSelfDeleted).toBe(false);
      expect(user.backupAuth).toBe(null);
      expect(user.selfDeletedAt).toBe(null);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // * Validate the database state (AUTH)
      const auth = await authService.getByEmail(DTO.email, {}, false);
      expect(auth).toBeDefined();
      expect(auth.data.identifier).toBe(DTO.email);
      expect(auth.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(auth.data.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(auth.data.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [AUTH STATE]',
        );
      }
      expect(`${auth.data.userId}`).toEqual(`${user._id}`);
      expect(auth.data.googleSignInId).toBeDefined();
      expect(auth.data.appleSignInId).toBeDefined();
      expect(auth.data.facebookSignId).toBeDefined();
      expect(auth.data.githubSignId).toBeDefined();
      expect(auth.data.gitlabSignId).toBeDefined();
      expect(auth.data.microsoftSignId).toBeDefined();
      expect(auth.data.password).toBeDefined();
      expect(auth.data.code).toBeDefined();
      expect(auth.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(auth.data.codeExpiredAt).toBeDefined();
      expect(auth.data.isIdentifierVerified).toBe(true);
      expect(auth.data.isActivated).toBe(true);
      expect(auth.data.inactivatedAt).toBe(null);
      expect(auth.data.createdAt).toBeDefined();
      expect(auth.data.updatedAt).toBeDefined();
      expect(auth.data.lastChangedPasswordAt).toBe(null);
    });
    it(`Valid EmailSignUpDto (empty displayName), should return 201 and validate database state`, async () => {
      jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
        // * We are not testing the real mail service here, will test on MailController
        return Promise.resolve({ mailId: 'mailId', statusText: '202' });
      });
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: '',
      };
      // * Validate the response
      const res = await request(app.getHttpServer())
        .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send(DTO);
      expect(res.status).toBe(201);
      expect(res.body.email).toBe(DTO.email);
      expect(res.body.isEmailSent).toBe(false);
      expect(res.body.canResendAt).toBeDefined();
      expect(res.body.provider).toBeDefined();
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(res.body.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(res.body.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      }
      // * Validate the database state (USER)
      const user = await userService.findByEmail(DTO.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(DTO.email);
      expect(user.firstName).toBe(DTO.firstName);
      expect(user.lastName).toBe(DTO.lastName);
      expect(user.displayName).toBe(`${DTO.firstName} ${DTO.lastName}`);
      expect(user.isEmailVerified).toBe(true);
      expect(user.isSelfDeleted).toBe(false);
      expect(user.backupAuth).toBe(null);
      expect(user.selfDeletedAt).toBe(null);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // * Validate the database state (AUTH)
      const auth = await authService.getByEmail(DTO.email, {}, false);
      expect(auth).toBeDefined();
      expect(auth.data.identifier).toBe(DTO.email);
      expect(auth.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
      if (process.env.DATABASE_PROVIDER === 'MONGODB') {
        expect(auth.data.provider).toBe(AUTH_PROVIDER.MONGOOSE);
      } else {
        expect(auth.data.provider).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [AUTH STATE]',
        );
      }
      expect(`${auth.data.userId}`).toEqual(`${user._id}`);
      expect(auth.data.googleSignInId).toBeDefined();
      expect(auth.data.appleSignInId).toBeDefined();
      expect(auth.data.facebookSignId).toBeDefined();
      expect(auth.data.githubSignId).toBeDefined();
      expect(auth.data.gitlabSignId).toBeDefined();
      expect(auth.data.microsoftSignId).toBeDefined();
      expect(auth.data.password).toBeDefined();
      expect(auth.data.code).toBeDefined();
      expect(auth.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
      expect(auth.data.codeExpiredAt).toBeDefined();
      expect(auth.data.isIdentifierVerified).toBe(true);
      expect(auth.data.isActivated).toBe(true);
      expect(auth.data.inactivatedAt).toBe(null);
      expect(auth.data.createdAt).toBeDefined();
      expect(auth.data.updatedAt).toBeDefined();
      expect(auth.data.lastChangedPasswordAt).toBe(null);
    });
  });
  it(`Failed Mail Service (should not affect this GPI), should return 201 and validate database state`, async () => {
    jest.spyOn(mailService, 'send').mockImplementationOnce(() => {
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
    // * Validate the response
    const res = await request(app.getHttpServer())
      .post(`${VERIFIED_EMAIL_SIGN_UP_GPI}`)
      .set(ClientKeyHeader())
      .set(BearerHeader(sysOwnerAccessToken))
      .send(DTO);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(DTO.email);
    expect(res.body.isEmailSent).toBe(false);
    expect(res.body.canResendAt).toBeDefined();
    expect(res.body.provider).toBeDefined();
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      expect(res.body.provider).toBe(AUTH_PROVIDER.MONGOOSE);
    } else {
      expect(res.body.provider).toBe(
        'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
      );
    }
    // * Validate the database state (USER)
    const user = await userService.findByEmail(DTO.email);
    expect(user).toBeDefined();
    expect(user.email).toBe(DTO.email);
    expect(user.firstName).toBe(DTO.firstName);
    expect(user.lastName).toBe(DTO.lastName);
    expect(user.displayName).toBe(DTO.displayName);
    expect(user.isEmailVerified).toBe(true);
    expect(user.isSelfDeleted).toBe(false);
    expect(user.backupAuth).toBe(null);
    expect(user.selfDeletedAt).toBe(null);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    // * Validate the database state (AUTH)
    const auth = await authService.getByEmail(DTO.email, {}, false);
    expect(auth).toBeDefined();
    expect(auth.data.identifier).toBe(DTO.email);
    expect(auth.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      expect(auth.data.provider).toBe(AUTH_PROVIDER.MONGOOSE);
    } else {
      expect(auth.data.provider).toBe(
        'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [AUTH STATE]',
      );
    }
    expect(`${auth.data.userId}`).toEqual(`${user._id}`);
    expect(auth.data.googleSignInId).toBeDefined();
    expect(auth.data.appleSignInId).toBeDefined();
    expect(auth.data.facebookSignId).toBeDefined();
    expect(auth.data.githubSignId).toBeDefined();
    expect(auth.data.gitlabSignId).toBeDefined();
    expect(auth.data.microsoftSignId).toBeDefined();
    expect(auth.data.password).toBeDefined();
    expect(auth.data.code).toBeDefined();
    expect(auth.data.codeUsage).toBe(AUTH_CODE_USAGE.SIGN_UP_VERIFY);
    expect(auth.data.codeExpiredAt).toBeDefined();
    expect(auth.data.isIdentifierVerified).toBe(true);
    expect(auth.data.isActivated).toBe(true);
    expect(auth.data.inactivatedAt).toBe(null);
    expect(auth.data.createdAt).toBeDefined();
    expect(auth.data.updatedAt).toBeDefined();
    expect(auth.data.lastChangedPasswordAt).toBe(null);
  });
  const VERIFICATION_GPI = `${TARGET_PATH}/${VERIFICATION_PATH}`;
  describe(`[POST] ${VERIFICATION_GPI}`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .send({})
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .expect(400);
    });
    it(`EmptyBearerHeader, should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(400);
    });
    it('Invalid AuthVerifyDto (identifier, empty string), should return 400', () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: '',
          code: '123456',
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        })
        .expect(400);
    });
    it('Invalid AuthVerifyDto (identifier, boolean), should return 400', () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: true,
          code: '123456',
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        })
        .expect(400);
    });
    it('Invalid AuthVerifyDto (code invalid, less that 6), should return 400', () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: 'jester_should_not_created@user.com',
          code: '123',
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        })
        .expect(400);
    });
    it('Invalid AuthVerifyDto (code invalid, number), should return 400', () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: 'jester_should_not_created@user.com',
          code: 123456,
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        })
        .expect(400);
    });
    it(`Invalid AuthVerifyDto (codeUsage, ${AUTH_CODE_USAGE.NOT_SET}), should return 400`, () => {
      return request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: 'jester_should_not_created@user.com',
          code: '123456',
          codeUsage: AUTH_CODE_USAGE.NOT_SET,
        })
        .expect(400);
    });
    it(`Identifier not exist, should return 404 with ${ERROR_CODE.AUTH_NOT_FOUND}`, async () => {
      const res = await request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: 'jester_should_not_found@user.com',
          code: '123456',
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      expect(res.status).toBe(404);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.AUTH_NOT_FOUND);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(404);
    });
    it(`Identifier exist but user not exist (should not happened), should return 404 with ${ERROR_CODE.USER_NOT_FOUND}`, async () => {
      // * Simulate sign up
      const DTO: IEmailSignUp = {
        email: `jester_${new Date().getTime()}@user.com`,
        password: `123456`,
        firstName: 'fstName',
        lastName: 'lstName',
        displayName: 'displayName',
      };
      await authService.emailSignUp(DTO, false);
      // * Simulate User got delete
      const auth = await authService.getByEmail(DTO.email, {}, false);
      await userService.deleteById(`${auth.data.userId}`);
      const res = await request(app.getHttpServer())
        .post(`${VERIFICATION_GPI}`)
        .set(ClientKeyHeader())
        .send({
          identifier: DTO.email,
          code: '123456',
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        });
      expect(res.status).toBe(404);
      expect(res.body.source).toBeDefined();
      expect(res.body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(res.body.message).toBeDefined();
      expect(res.body.statusCode).toBe(404);
    });
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
