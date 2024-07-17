import { Test, TestingModule } from '@nestjs/testing';
import { UserMongooseService } from './user.mongoose.service';

describe('UserMongooseService', () => {
  let service: UserMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMongooseService],
    }).compile();

    service = module.get<UserMongooseService>(UserMongooseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
