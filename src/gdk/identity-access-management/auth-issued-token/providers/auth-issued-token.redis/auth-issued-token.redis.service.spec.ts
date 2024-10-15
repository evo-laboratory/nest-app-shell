import { Test, TestingModule } from '@nestjs/testing';
import { AuthIssuedTokenRedisService } from './auth-issued-token.redis.service';

describe('AuthIssuedTokenRedisService', () => {
  let service: AuthIssuedTokenRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthIssuedTokenRedisService],
    }).compile();

    service = module.get<AuthIssuedTokenRedisService>(AuthIssuedTokenRedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
