import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';

export async function TestModuleBuilderFixture(): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
}
