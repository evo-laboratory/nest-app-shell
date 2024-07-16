import { Test, TestingModule } from '@nestjs/testing';
import { UserPrismaService } from './user.prisma.service';

describe('UserPrismaService', () => {
  let service: UserPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPrismaService],
    }).compile();

    service = module.get<UserPrismaService>(UserPrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
