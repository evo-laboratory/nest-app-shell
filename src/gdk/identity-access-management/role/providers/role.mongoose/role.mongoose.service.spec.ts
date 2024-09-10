import { Test, TestingModule } from '@nestjs/testing';
import { RoleMongooseService } from './role.mongoose.service';

describe('RoleMongooseService', () => {
  let service: RoleMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleMongooseService],
    }).compile();

    service = module.get<RoleMongooseService>(RoleMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
