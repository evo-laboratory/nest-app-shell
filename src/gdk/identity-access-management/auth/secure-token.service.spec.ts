import { Test, TestingModule } from '@nestjs/testing';
import { SecureTokenService } from './secure-token.service';

describe('SecureTokenService', () => {
  let service: SecureTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureTokenService],
    }).compile();

    service = module.get<SecureTokenService>(SecureTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
