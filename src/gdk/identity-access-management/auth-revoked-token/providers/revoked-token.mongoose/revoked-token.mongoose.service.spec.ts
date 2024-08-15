import { Test, TestingModule } from '@nestjs/testing';
import { RevokedTokenMongooseService } from './revoked-token.mongoose.service';

describe('RevokedTokenMongooseService', () => {
  let service: RevokedTokenMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevokedTokenMongooseService],
    }).compile();

    service = module.get<RevokedTokenMongooseService>(RevokedTokenMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
