import { Test, TestingModule } from '@nestjs/testing';
import { SystemUtilService } from './system-util.service';

describe('SystemUtilService', () => {
  let service: SystemUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemUtilService],
    }).compile();

    service = module.get<SystemUtilService>(SystemUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
