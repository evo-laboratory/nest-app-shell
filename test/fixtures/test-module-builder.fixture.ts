import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import appConfig from 'src/app.config';
import { AppModule } from 'src/app.module';
import { EnvironmentConfigSchema } from 'src/environment-config.schema';

export async function TestModuleBuilderFixture(): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      AppModule,
      ConfigModule.forRoot({
        validationSchema: EnvironmentConfigSchema,
        load: [appConfig],
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService) => ({
          uri: configService.get('MONGO_URI'),
          dbName: configService.get('MONGO_DB_NAME'),
          autoCreate: true,
        }),
      }),
    ],
  }).compile();
}
