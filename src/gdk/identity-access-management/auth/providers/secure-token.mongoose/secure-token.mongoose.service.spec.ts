import { Test, TestingModule } from '@nestjs/testing';
import { SecureTokenMongooseService } from './secure-token.mongoose.service';

describe('SecureTokenMongooseService', () => {
  let service: SecureTokenMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureTokenMongooseService],
    }).compile();

    service = module.get<SecureTokenMongooseService>(SecureTokenMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
