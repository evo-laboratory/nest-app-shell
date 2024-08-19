import { Test, TestingModule } from '@nestjs/testing';
import { AuthRevokedTokenService } from './auth-revoked-token.service';

describe('AuthRevokedTokenService', () => {
  let service: AuthRevokedTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // providers: [AuthRevokedTokenService],
    }).compile();

    service = module.get<AuthRevokedTokenService>(AuthRevokedTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
