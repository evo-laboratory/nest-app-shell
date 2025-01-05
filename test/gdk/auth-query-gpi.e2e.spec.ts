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
import { AUTH_API, EMAIL_PATH, IDENTIFIER_PATH } from '@gdk-iam/auth/statics';
import { AUTH_IDENTIFIER_TYPE } from '@gdk-iam/auth/enums';
import { IEmailSignUp } from '@gdk-iam/auth/types';
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
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('Populate relationFields(userId), should return User in response', async () => {
        const res = await request(app.getHttpServer())
          .get(`${LIST_API}`)
          .query({ relationFields: 'userId' })
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({});
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        const fstData = res.body.data[0];
        console.log(fstData);
        expect(fstData.userId).toBeDefined();
        expect(fstData.userId).toBeInstanceOf(Object);
        expect(fstData.userId._id).toBeDefined();
        expect(fstData.userId.email).toBeDefined();
        expect(fstData.userId.roleList).toBeDefined();
        expect(fstData.userId.roleList).toBeInstanceOf(Array);
        expect(fstData.userId.firstName).toBeDefined();
        expect(fstData.userId.lastName).toBeDefined();
        expect(fstData.userId.displayName).toBeDefined();
        expect(fstData.userId.isEmailVerified).toBeDefined();
        expect(fstData.userId.isSelfDeleted).toBeDefined();
        expect(fstData.userId.backupAuth).toBeDefined();
        expect(fstData.userId.selfDeletedAt).toBeDefined();
        expect(fstData.userId.createdAt).toBeDefined();
        expect(fstData.userId.updatedAt).toBeDefined();
      });
    } else {
      // * Please Test your own database provider
      it('[LIST_API] Populate relationFields(userId), should return User in response', () => {
        expect(true).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      });
    }
  });
  const GET_BY_EMAIL_API = `${TARGET_PATH}/${EMAIL_PATH}`;
  describe(`[GET] ${GET_BY_EMAIL_API}/:email`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Object);
          expect(res.body.data.identifier).toBe(JESTER01_EMAIL);
          expect(res.body.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
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
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .query({ fieldSelection: positiveSelect.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      Object.keys(testData).forEach((key) => {
        expect(testData[key]).toBeDefined();
      });
      // * Expecting the length of the object to be the same as the positiveSelect, + 1 for the _id
      expect(Object.keys(testData).length).toBe(positiveSelect.length + 1);
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
        .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
        .query({ fieldSelection: negativeSelection.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      negativeSelection.forEach((key) => {
        expect(testData[key.replace('-', '')]).not.toBeDefined();
      });
    });
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('Populate relationFields(userId), should return User in response', async () => {
        const res = await request(app.getHttpServer())
          .get(`${GET_BY_EMAIL_API}/${JESTER01_EMAIL}`)
          .query({ relationFields: 'userId' })
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({});
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
        expect(res.body.data.userId).toBeInstanceOf(Object);
        expect(res.body.data.userId._id).toBeDefined();
        expect(res.body.data.userId.email).toBe(JESTER01_EMAIL);
        expect(res.body.data.userId.roleList).toBeDefined();
        expect(res.body.data.userId.roleList).toBeInstanceOf(Array);
        expect(res.body.data.userId.roleList).toContainEqual(TEST_GENERAL_ROLE);
        expect(res.body.data.userId.firstName).toBeDefined();
        expect(res.body.data.userId.lastName).toBeDefined();
        expect(res.body.data.userId.displayName).toBeDefined();
        expect(res.body.data.userId.isEmailVerified).toBeDefined();
        expect(res.body.data.userId.isSelfDeleted).toBeDefined();
        expect(res.body.data.userId.backupAuth).toBeDefined();
        expect(res.body.data.userId.selfDeletedAt).toBeDefined();
        expect(res.body.data.userId.createdAt).toBeDefined();
        expect(res.body.data.userId.updatedAt).toBeDefined();
      });
    } else {
      // * Please Test your own database provider
      it('[LIST_API] Populate relationFields(userId), should return User in response', () => {
        expect(true).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      });
    }
  });
  const GET_BY_IDENTIFIER_API = `${TARGET_PATH}/${IDENTIFIER_PATH}`;
  describe(`[GET] ${GET_BY_IDENTIFIER_API}/:email`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it('BearerHeader (system-owner), should return 200', () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Object);
          expect(res.body.data.identifier).toBe(JESTER01_EMAIL);
          expect(res.body.data.identifierType).toBe(AUTH_IDENTIFIER_TYPE.EMAIL);
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
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .query({ fieldSelection: positiveSelect.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      Object.keys(testData).forEach((key) => {
        expect(testData[key]).toBeDefined();
      });
      // * Expecting the length of the object to be the same as the positiveSelect, + 1 for the _id
      expect(Object.keys(testData).length).toBe(positiveSelect.length + 1);
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
        .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
        .query({ fieldSelection: negativeSelection.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      negativeSelection.forEach((key) => {
        expect(testData[key.replace('-', '')]).not.toBeDefined();
      });
    });
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('Populate relationFields(userId), should return User in response', async () => {
        const res = await request(app.getHttpServer())
          .get(`${GET_BY_IDENTIFIER_API}/${JESTER01_EMAIL}`)
          .query({ relationFields: 'userId' })
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({});
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
        expect(res.body.data.userId).toBeInstanceOf(Object);
        expect(res.body.data.userId._id).toBeDefined();
        expect(res.body.data.userId.email).toBe(JESTER01_EMAIL);
        expect(res.body.data.userId.roleList).toBeDefined();
        expect(res.body.data.userId.roleList).toBeInstanceOf(Array);
        expect(res.body.data.userId.roleList).toContainEqual(TEST_GENERAL_ROLE);
        expect(res.body.data.userId.firstName).toBeDefined();
        expect(res.body.data.userId.lastName).toBeDefined();
        expect(res.body.data.userId.displayName).toBeDefined();
        expect(res.body.data.userId.isEmailVerified).toBeDefined();
        expect(res.body.data.userId.isSelfDeleted).toBeDefined();
        expect(res.body.data.userId.backupAuth).toBeDefined();
        expect(res.body.data.userId.selfDeletedAt).toBeDefined();
        expect(res.body.data.userId.createdAt).toBeDefined();
        expect(res.body.data.userId.updatedAt).toBeDefined();
      });
    } else {
      // * Please Test your own database provider
      it('[GET_BY_IDENTIFIER_API] Populate relationFields(userId), should return User in response', () => {
        expect(true).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      });
    }
  });
  const GET_BY_ID_API = `${TARGET_PATH}`;
  describe(`[GET] ${GET_BY_ID_API}/:id`, () => {
    it(`ClientGuarded: ${process.env.CLIENT_KEY_NAME}, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .expect(403);
    });
    it(`Pass in ${process.env.CLIENT_KEY_NAME}, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .expect(401);
    });
    it(`EmptyBearerHeader, should return 401`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .set(EmptyBearerHeader())
        .expect(401);
    });
    it(`Not exist id, should return 404`, () => {
      return request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${TEST_VALID_MONGODB_OBJECT_ID}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .expect(404);
    });
    it(`Exist id, should return 200`, async () => {
      // * Usually with MailService
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
      await authService.emailSignUp(DTO, false);
      const auth = await authService.getByEmail(DTO.email, {}, false);
      return request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${auth.data._id}`)
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .expect(200);
    });
    it('Query with field selections (positive)', async () => {
      // * Usually with MailService
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
      await authService.emailSignUp(DTO, false);
      const auth = await authService.getByEmail(DTO.email, {}, false);
      // * Below should be one of the fields in the IAuth
      const positiveSelect = [
        'identifier',
        'identifierType',
        'userId',
        'createdAt',
      ];
      const res = await request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${auth.data._id}`)
        .query({ fieldSelection: positiveSelect.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      Object.keys(testData).forEach((key) => {
        expect(testData[key]).toBeDefined();
      });
      // * Expecting the length of the object to be the same as the positiveSelect, + 1 for the _id
      expect(Object.keys(testData).length).toBe(positiveSelect.length + 1);
    });
    it('Query with field selections (negative)', async () => {
      // * Usually with MailService
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
      await authService.emailSignUp(DTO, false);
      const auth = await authService.getByEmail(DTO.email, {}, false);
      // * Below should be one of the fields in the IAuth
      const negativeSelection = [
        '-identifier',
        '-identifierType',
        '-userId',
        '-createdAt',
      ];
      const res = await request(app.getHttpServer())
        .get(`${GET_BY_ID_API}/${auth.data._id}`)
        .query({ fieldSelection: negativeSelection.join(',') })
        .set(ClientKeyHeader())
        .set(BearerHeader(sysOwnerAccessToken))
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const testData = res.body.data;
      negativeSelection.forEach((key) => {
        expect(testData[key.replace('-', '')]).not.toBeDefined();
      });
    });
    if (process.env.DATABASE_PROVIDER === 'MONGODB') {
      it('Populate relationFields(userId), should return User in response', async () => {
        // * Usually with MailService
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
        await authService.emailSignUp(DTO, false);
        const auth = await authService.getByEmail(DTO.email, {}, false);
        const res = await request(app.getHttpServer())
          .get(`${GET_BY_ID_API}/${auth.data._id}`)
          .query({ relationFields: 'userId' })
          .set(ClientKeyHeader())
          .set(BearerHeader(sysOwnerAccessToken))
          .send({});
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
        expect(res.body.data.userId).toBeInstanceOf(Object);
        expect(res.body.data.userId._id).toBeDefined();
        expect(res.body.data.userId.email).toBe(DTO.email);
        expect(res.body.data.userId.roleList).toBeDefined();
        expect(res.body.data.userId.roleList).toBeInstanceOf(Array);
        expect(res.body.data.userId.firstName).toBeDefined();
        expect(res.body.data.userId.lastName).toBeDefined();
        expect(res.body.data.userId.displayName).toBeDefined();
        expect(res.body.data.userId.isEmailVerified).toBeDefined();
        expect(res.body.data.userId.isSelfDeleted).toBeDefined();
        expect(res.body.data.userId.backupAuth).toBeDefined();
        expect(res.body.data.userId.selfDeletedAt).toBeDefined();
        expect(res.body.data.userId.createdAt).toBeDefined();
        expect(res.body.data.userId.updatedAt).toBeDefined();
      });
    } else {
      // * Please Test your own database provider
      it('[GET_BY_IDENTIFIER_API] Populate relationFields(userId), should return User in response', () => {
        expect(true).toBe(
          'FORCE THROW ERROR, PLEASE UPDATE THIS TEST CASE [RES]',
        );
      });
    }
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
