import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypeormService } from './role.typeorm.service';

describe('RoleTypeormService', () => {
  let service: RoleTypeormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleTypeormService],
    }).compile();

    service = module.get<RoleTypeormService>(RoleTypeormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
