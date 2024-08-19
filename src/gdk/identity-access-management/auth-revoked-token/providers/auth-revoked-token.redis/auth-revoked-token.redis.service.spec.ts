import { Test, TestingModule } from '@nestjs/testing';
import { AuthRevokedTokenRedisService } from './auth-revoked-token.redis.service';

describe('AuthRevokedTokenRedisService', () => {
  let service: AuthRevokedTokenRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRevokedTokenRedisService],
    }).compile();

    service = module.get<AuthRevokedTokenRedisService>(
      AuthRevokedTokenRedisService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
