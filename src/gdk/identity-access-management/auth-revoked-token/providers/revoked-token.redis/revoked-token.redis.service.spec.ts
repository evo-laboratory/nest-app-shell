import { Test, TestingModule } from '@nestjs/testing';
import { RevokedTokenRedisService } from './revoked-token.redis.service';

describe('RevokedTokenRedisService', () => {
  let service: RevokedTokenRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevokedTokenRedisService],
    }).compile();

    service = module.get<RevokedTokenRedisService>(RevokedTokenRedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
