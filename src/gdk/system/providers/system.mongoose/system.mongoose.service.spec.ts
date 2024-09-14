import { Test, TestingModule } from '@nestjs/testing';
import { SystemMongooseService } from './system.mongoose.service';

describe('SystemMongooseService', () => {
  let service: SystemMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemMongooseService],
    }).compile();

    service = module.get<SystemMongooseService>(SystemMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
