import { Test, TestingModule } from '@nestjs/testing';
import { AuthActivitiesMongooseService } from './auth-activities.mongoose.service';

describe('AuthActivitiesMongooseService', () => {
  let service: AuthActivitiesMongooseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthActivitiesMongooseService],
    }).compile();

    service = module.get<AuthActivitiesMongooseService>(
      AuthActivitiesMongooseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
