import { AuthService } from '@gdk-iam/auth/auth.service';
import { EmailSignUpDto } from '@gdk-iam/auth/dto/email-signup.dto';
import { AUTH_MODEL_NAME } from '@gdk-iam/auth/types/auth.static';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MethodLogger } from '@shared/winston-logger';
import { Auth } from './auth.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { strict as assert } from 'assert';
import { UserService } from '@gdk-iam/user/user.service';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from '@gdk-iam/auth/types';
import { IEmailSignUpRes } from '@gdk-iam/auth/types/email-signup.interface';
import { CreateAuthDto } from '@gdk-iam/auth/dto/create-auth.dto';

@Injectable()
export class AuthMongooseService implements AuthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(AUTH_MODEL_NAME)
    private readonly AuthModel: Model<Auth>,
    private readonly userService: UserService,
  ) {}
  @MethodLogger()
  public async emailSignUp(
    dto: EmailSignUpDto,
    session?: ClientSession,
  ): Promise<IEmailSignUpRes> {
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Check Email Existence(Both Auth And User)
      const checkEmail = await this.userService.findByEmail(dto.email);
      if (checkEmail !== null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_EMAIL_EXIST,
          `${dto.email} already existed`,
          400,
          'emailSignUp',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Setup Transaction Session
      session.startTransaction();
      // * STEP 3. Create New User
      const newUser = await this.userService.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName
          ? dto.displayName
          : `${dto.firstName} ${dto.lastName}`,
      });
      assert.ok(newUser, 'New User Created');
      const newAuth = await this.create({
        provider: AUTH_PROVIDER.MONGOOSE,
        userId: newUser._id,
        password: dto.password,
        codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
      });
      assert.ok(newAuth, 'New Auth Created');
      await session.commitTransaction();
      await session.endSession();
      const res: IEmailSignUpRes = {
        email: dto.email,
        isEmailSent: false,
        canResendAt: Date.now(),
        provider: AUTH_PROVIDER.MONGOOSE,
      };
      return res;
      // * Generate Code & SendEmail
      // * Create new Auth
      // * Update new User.authId
      // * Complete session
    } catch (error) {
      if (session.inTransaction()) {
        console.log('inTransaction');
        await session.abortTransaction();
        await session.endSession();
      }
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

  private create(dto: CreateAuthDto, hashPassword = true, resolveCode = true) {
    try {
      return dto;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  private buildError(
    code: ERROR_CODE,
    msg: string,
    statusCode?: number,
    methodName?: string,
  ): IUnitedHttpException {
    const errorObj: IUnitedHttpException = {
      isUnitedHttpException: true,
      source: ERROR_SOURCE.NESTJS,
      errorCode: code || ERROR_CODE.UNKNOWN,
      message: msg,
      statusCode: statusCode || 500,
      contextName: 'AuthMongooseService',
      methodName: `${methodName}`,
    };
    return errorObj;
  }
}
