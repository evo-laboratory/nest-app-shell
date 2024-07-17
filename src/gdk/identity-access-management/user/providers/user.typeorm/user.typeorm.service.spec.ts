import { Test, TestingModule } from '@nestjs/testing';
import { UserTypeormService } from './user.typeorm.service';

describe('UserTypeormService', () => {
  let service: UserTypeormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTypeormService],
    }).compile();

    service = module.get<UserTypeormService>(UserTypeormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
