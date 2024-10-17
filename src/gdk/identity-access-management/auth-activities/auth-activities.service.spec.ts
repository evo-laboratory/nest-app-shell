import { Test, TestingModule } from '@nestjs/testing';
import { AuthActivitiesService } from './auth-activities.service';

describe('AuthActivitiesService', () => {
  let service: AuthActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = module.get<AuthActivitiesService>(AuthActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
