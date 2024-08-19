import { Test, TestingModule } from '@nestjs/testing';
import { AuthRevokedTokenMongooseService } from './auth-revoked-token.mongoose.service';
// import { RevokedTokenMongooseService } from './revoked-token.mongoose.service';

describe('AuthRevokedTokenMongooseService', () => {
  let service: AuthRevokedTokenMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRevokedTokenMongooseService],
    }).compile();

    service = module.get<AuthRevokedTokenMongooseService>(
      AuthRevokedTokenMongooseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
