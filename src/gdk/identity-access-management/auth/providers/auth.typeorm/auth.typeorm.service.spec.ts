import { Test, TestingModule } from '@nestjs/testing';
import { AuthTypeormService } from './auth.typeorm.service';

describe('AuthTypeormService', () => {
  let service: AuthTypeormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthTypeormService],
    }).compile();

    service = module.get<AuthTypeormService>(AuthTypeormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
