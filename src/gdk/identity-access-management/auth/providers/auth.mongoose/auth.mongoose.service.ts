import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MethodLogger } from '@shared/winston-logger';
import { ClientSession, Connection, Model } from 'mongoose';
import { strict as assert } from 'assert';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { MinToMilliseconds, RandomNumber } from '@shared/helper';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { MailService } from '@gdk-mail/mail.service';
import { UserService } from '@gdk-iam/user/user.service';
import { EncryptService } from '@gdk-iam/encrypt/encrypt.service';
import { EmailSignUpDto } from '@gdk-iam/auth/dto/email-signup.dto';
import { AUTH_MODEL_NAME } from '@gdk-iam/auth/types/auth.static';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from '@gdk-iam/auth/types';
import { IEmailSignUpRes } from '@gdk-iam/auth/types/email-signup.interface';
import { CreateAuthDto } from '@gdk-iam/auth/dto/create-auth.dto';
import { AUTH_SIGN_UP_METHOD } from '@gdk-iam/auth/types/auth-sign-up-method.enum';
import { ICreateAuthResult } from '@gdk-iam/auth/types/create-auth.interface';

import { Auth } from './auth.schema';
import { ISendMail } from '@gdk-mail/types/send-mail.interface';
import { AuthVerifyDto } from '@gdk-iam/auth/dto/auth-verify.dto';
import { AUTH_IDENTIFIER_TYPE } from '@gdk-iam/auth/types/auth-identifier-type';

@Injectable()
export class AuthMongooseService implements AuthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(AUTH_MODEL_NAME)
    private readonly AuthModel: Model<Auth>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly encryptService: EncryptService,
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
      const checkUserEmail = await this.userService.findByEmail(dto.email);
      if (checkUserEmail !== null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_EMAIL_EXIST,
          `Email: ${dto.email} already existed`,
          400,
          'emailSignUp.checkUserEmail',
        );
        throw new UniteHttpException(error);
      }
      const checkAuthIdentifier = await this.AuthModel.findOne({
        identifier: dto.email,
      });
      if (checkAuthIdentifier !== null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_EXIST,
          `Identifier: ${dto.email} already existed`,
          400,
          'emailSignUp.checkAuthIdentifier',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Setup Transaction Session
      session.startTransaction();
      // * STEP 3. Create New User
      const newUser = await this.userService.create(
        {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: dto.displayName
            ? dto.displayName
            : `${dto.firstName} ${dto.lastName}`,
        },
        session,
      );
      assert.ok(newUser, 'New User Created');
      // * STEP 4. Create New Auth
      const newAuth: ICreateAuthResult = await this.create(
        {
          identifierType: AUTH_IDENTIFIER_TYPE.EMAIL,
          identifier: dto.email,
          signUpMethodList: [AUTH_SIGN_UP_METHOD.EMAIL_PASSWORD],
          provider: AUTH_PROVIDER.MONGOOSE,
          userId: newUser._id,
          password: dto.password,
          codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        },
        session,
        true,
        true,
      );
      assert.ok(newAuth, 'New Auth Created');
      // * STEP 5. Send Email
      const mail: ISendMail = {
        to: dto.email,
        subject: '註冊驗證碼',
        text: newAuth.code,
        html: `<h1>驗證碼 : ${newAuth.code}</h1>`,
      };
      const sent = await this.mailService.send(mail);
      assert.ok(sent, 'Verify Email Sent');
      // * STEP 6. Complete session
      await session.commitTransaction();
      await session.endSession();
      const res: IEmailSignUpRes = {
        email: dto.email,
        isEmailSent: true,
        canResendAt: newAuth.codeExpiredAt,
        provider: AUTH_PROVIDER.MONGOOSE,
      };
      return res;
    } catch (error) {
      if (session.inTransaction()) {
        console.log('inTransaction');
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async verifyAuth(dto: AuthVerifyDto): Promise<boolean> {
    return true;
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

  @MethodLogger()
  private async create(
    dto: CreateAuthDto,
    session?: ClientSession,
    hashPassword = true,
    resolveCode = true,
  ): Promise<ICreateAuthResult> {
    try {
      const code = RandomNumber();
      const EXPIRE_MIN = process.env.CODE_EXPIRE_MIN || 3;
      const expiredAt = Date.now() + MinToMilliseconds(EXPIRE_MIN);
      let authPassword = dto.password;
      if (hashPassword) {
        authPassword = await this.encryptService.hashPassword(authPassword);
      }
      const newAuth = await new this.AuthModel({
        ...dto,
        password: authPassword,
        code: resolveCode ? code : '',
        codeExpiredAt: resolveCode ? expiredAt : 0,
      }).save({ session });
      const result: ICreateAuthResult = {
        identifierType: dto.identifierType,
        identifier: newAuth.identifier,
        code: newAuth.code,
        codeUsage: newAuth.codeUsage,
        codeExpiredAt: resolveCode ? expiredAt : 0,
      };
      return result;
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
