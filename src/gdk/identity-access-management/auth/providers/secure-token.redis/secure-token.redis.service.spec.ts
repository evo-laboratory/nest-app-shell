import { Test, TestingModule } from '@nestjs/testing';
import { SecureTokenRedisService } from './secure-token.redis.service';

describe('SecureTokenRedisService', () => {
  let service: SecureTokenRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureTokenRedisService],
    }).compile();

    service = module.get<SecureTokenRedisService>(SecureTokenRedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
