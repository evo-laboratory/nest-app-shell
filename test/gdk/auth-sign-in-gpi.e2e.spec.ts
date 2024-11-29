import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { WinstonService } from '@shared/winston-logger';
import { BearerHeader, ClientKeyHeader, EmptyBearerHeader } from 'test/data';
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
import { AUTH_API, EMAIL_SIGN_IN_PATH } from '@gdk-iam/auth/statics';

describe('GDK/AuthController', () => {
  const CONTROLLER_ENDPOINT = `/${GPI}/${AUTH_API}`;
  const TARGET_PATH = `${CONTROLLER_ENDPOINT}/${V1}`;
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
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
  });
  // * --- End of TEST CASES ---
  afterAll(async () => {
    await app.close();
  });
});
