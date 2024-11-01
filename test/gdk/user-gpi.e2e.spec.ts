import * as request from 'supertest';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { USER_API } from '@gdk-iam/user/types';
import { UserService } from '@gdk-iam/user/user.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { WinstonService } from '@shared/winston-logger';
import { TestModuleBuilderFixture } from 'test/fixtures';
import { DatabaseTestHelper } from 'test/helpers';
import { MONGO_E2E_TEST_DB } from 'test/data';

describe('GDK/UserController', () => {
  const _USER_API = `/${GPI}/${USER_API}`;
  const USER_RESOURCE_V1_PATH = `${_USER_API}/${V1}`;
  let app: INestApplication;
  let DBTestHelper: DatabaseTestHelper;
  let authService: AuthService;
  let userService: UserService;
  let sysOwnerAccessToken: string;

  beforeAll(async () => {
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
    DBTestHelper = await DatabaseTestHelper.init(
      process.env.DATABASE_PROVIDER as 'MONGODB',
      process.env.MONGO_URI,
      MONGO_E2E_TEST_DB,
    );
    await DBTestHelper.setupSystem();
    await app.init();
    userService = app.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  describe(`[GET] ${USER_RESOURCE_V1_PATH}/${LIST_PATH}`, () => {
    it(`ClientGuarded by default, should return 403`, () => {
      return request(app.getHttpServer())
        .get(`${USER_RESOURCE_V1_PATH}/${LIST_PATH}`)
        .expect(403);
    });
  });
  afterAll(async () => {
    await DBTestHelper.clearDatabase();
    await DBTestHelper.disconnect();
    await app.close();
  });
});
