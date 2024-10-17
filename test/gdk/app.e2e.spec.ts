import { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestModuleBuilderFixture } from 'test/fixtures';
import { ENV_PATH } from '@shared/statics';

describe('GDK/AppController', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await TestModuleBuilderFixture();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    connection = await moduleFixture.get(getConnectionToken());
    await app.init();
  });
  it('GET / - Expect protected', () => {
    return request(app.getHttpServer()).get('/').expect(403);
  });
  it(`GET /${ENV_PATH} - Expect protected`, () => {
    return request(app.getHttpServer()).get(`/${ENV_PATH}`).expect(403);
  });
  afterAll(() => {
    setTimeout(async () => {
      await connection.close(true);
    }, 500);
  });
});
