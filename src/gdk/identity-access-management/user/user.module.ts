import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserPrismaService } from './providers/user.prisma/user.prisma.service';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useClass: UserPrismaService,
    },
  ],
})
export class UserModule {}
