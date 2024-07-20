import { AuthService } from '@gdk-iam/auth/auth.service';
import { EmailSignUpDto } from '@gdk-iam/auth/dto/email-signup.dto';
import { AUTH_MODEL_NAME } from '@gdk-iam/auth/types/auth.static';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MethodLogger } from '@shared/winston-logger';
import { Auth } from './auth.schema';
import { ClientSession, Model } from 'mongoose';
import { UserService } from '@gdk-iam/user/user.service';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';

@Injectable()
export class AuthMongooseService implements AuthService {
  constructor(
    @InjectModel(AUTH_MODEL_NAME)
    private readonly AuthModel: Model<Auth>,
    private readonly userService: UserService,
  ) {}
  @MethodLogger()
  public async emailSignUp(
    dto: EmailSignUpDto,
    session?: ClientSession,
  ): Promise<void> {
    try {
      // * Check Email Existence(Both Auth And User)
      // * Create new User
      // * Generate Code & SendEmail
      // * Create new Auth
      // * Update new User.authId
      // * Complete session
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  verifyAuth(): void {
    throw new Error('Method not implemented.');
  }
  emailVerification(): void {
    throw new Error('Method not implemented.');
  }
  emailPasswordSignIn(): void {
    throw new Error('Method not implemented.');
  }
  signOut(): void {
    throw new Error('Method not implemented.');
  }
  createAuth(): void {
    throw new Error('Method not implemented.');
  }
  getAuthById(): void {
    throw new Error('Method not implemented.');
  }
  getAuthByEmail(): void {
    throw new Error('Method not implemented.');
  }
  list(): void {
    throw new Error('Method not implemented.');
  }
  updateById(): void {
    throw new Error('Method not implemented.');
  }
  createCustomToken(): void {
    throw new Error('Method not implemented.');
  }
  signInWithCustomToken(): void {
    throw new Error('Method not implemented.');
  }
  enable(): void {
    throw new Error('Method not implemented.');
  }
  disable(): void {
    throw new Error('Method not implemented.');
  }
}
