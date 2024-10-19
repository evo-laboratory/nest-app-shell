import { Test, TestingModule } from '@nestjs/testing';
import { SystemMongooseService } from './system.mongoose.service';
import { SystemService } from '@gdk-system/system.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemModel, SystemSchema } from './system.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import appConfig from 'src/app.config';
import { EnvironmentConfigSchema } from 'src/environment-config.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('SystemMongooseService', () => {
  let service: SystemMongooseService;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: EnvironmentConfigSchema,
          load: [appConfig],
        }),
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: mongod.getUri(),
          }),
        }),
        MongooseModule.forFeature([
          { name: SystemModel.name, schema: SystemSchema },
        ]),
      ],
      providers: [
        {
          provide: SystemService,
          useClass: SystemMongooseService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {}, // Mock implementation of CACHE_MANAGER
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({}), // Mock implementation of ConfigService
          },
        },
      ],
    }).compile();

    service = module.get<SystemMongooseService>(SystemService);
  });

  it('should be defined, and provided as SystemService', () => {
    expect(service).toBeDefined();
  });
});
