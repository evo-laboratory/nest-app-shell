import { Test, TestingModule } from '@nestjs/testing';
import { AuthIssuedTokenMongooseService } from './auth-issued-token.mongoose.service';

describe('AuthIssuedTokenMongooseService', () => {
  let service: AuthIssuedTokenMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthIssuedTokenMongooseService],
    }).compile();

    service = module.get<AuthIssuedTokenMongooseService>(AuthIssuedTokenMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
