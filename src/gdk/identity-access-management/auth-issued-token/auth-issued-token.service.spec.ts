import { Test, TestingModule } from '@nestjs/testing';
import { AuthIssuedTokenService } from './auth-issued-token.service';

describe('AuthIssuedTokenService', () => {
  let service: AuthIssuedTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthIssuedTokenService],
    }).compile();

    service = module.get<AuthIssuedTokenService>(AuthIssuedTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
