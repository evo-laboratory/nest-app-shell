import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMongooseService } from './providers/auth.mongoose/auth.mongoose.service';
import { AuthTypeormService } from './providers/auth.typeorm/auth.typeorm.service';
import { AuthFirebaseService } from './providers/auth.firebase/auth.firebase.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthMongooseService,
    AuthTypeormService,
    AuthFirebaseService,
  ],
})
export class AuthModule {}
