import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigType } from '@nestjs/config';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { strict as assert } from 'assert';
import { MethodLogger } from '@shared/winston-logger';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { AuthUtilService } from '@gdk-iam/auth-util/auth-util.service';
import { AuthJwtService } from '@gdk-iam/auth-jwt/auth-jwt.service';
import { MailService } from '@gdk-mail/mail.service';
import { UserService } from '@gdk-iam/user/user.service';
import { EncryptService } from '@gdk-iam/encrypt/encrypt.service';
import {
  AUTH_MODEL_NAME,
  IEmailSignUpRes,
  ICreateAuthResult,
  AUTH_IDENTIFIER_TYPE,
  AUTH_METHOD,
  AUTH_PROVIDER,
  AUTH_CODE_USAGE,
  IAuthVerifyRes,
  EMAIL_VERIFICATION_ALLOW_AUTH_USAGE,
  IAuthGeneratedCode,
  IAuthSignInFailedRecordItem,
  IAuthTokenItem,
  AUTH_TOKEN_TYPE,
  IAuthSignInRes,
  IAuthDecodedToken,
  IAuthSignOutRes,
  IAuthCheckResult,
  IAuthExchangeNewAccessTokenRes,
} from '@gdk-iam/auth/types';
import {
  AuthCheckRefreshTokenDto,
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthExchangeNewAccessTokenDto,
  AuthSignOutDto,
  AuthVerifyDto,
  CreateAuthDto,
  EmailSignUpDto,
} from '@gdk-iam/auth/dto';
import { ISendMail } from '@gdk-mail/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';

import { Auth, AuthDocument } from './auth.schema';
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/types';
import { ExtractPropertiesFromObj } from '@shared/helper';
import { IUserTokenPayload } from '@gdk-iam/user/types';
// import { AuthSignOutDto } from '@gdk-iam/auth/dto/auth-sign-out.dto';
// import { AuthCheckRefreshTokenDto } from '@gdk-iam/auth/dto/auth-check-refresh-token.dto';
// import { AuthExchangeNewAccessTokenDto } from '@gdk-iam/auth/dto/auth-exchange-new-access-token.dto';
@Injectable()
export class AuthMongooseService implements AuthService {
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(AUTH_MODEL_NAME)
    private readonly AuthModel: Model<Auth>,
    private readonly authUtil: AuthUtilService,
    private readonly authJwt: AuthJwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly encryptService: EncryptService,
    private readonly revokeService: AuthRevokedTokenService,
  ) {
    console.log(this.iamConfig);
  }

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
      const newAuth = await this.create(
        {
          identifierType: AUTH_IDENTIFIER_TYPE.EMAIL,
          identifier: dto.email,
          signUpMethodList: [AUTH_METHOD.EMAIL_PASSWORD],
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
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async verifyAuth(
    dto: AuthVerifyDto,
    session?: ClientSession,
  ): Promise<IAuthVerifyRes> {
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      const currentTimeStamp = Date.now();
      // * STEP 1. Get Current Auth
      const auth = await this.AuthModel.findOne({ identifier: dto.identifier });
      if (auth === null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.identifier} not exist`,
          404,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Check User Exist
      const user = await this.userService.findById(`${auth.userId}`);
      if (user === null) {
        const error = this.buildError(
          ERROR_CODE.USER_NOT_FOUND,
          `User not exist`,
          404,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Check if already verified
      if (
        dto.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY &&
        auth.isIdentifierVerified
      ) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED,
          `Identifier: ${dto.identifier} already verified`,
          401,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 3. SIGN_UP_VERIFY
      if (
        dto.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY ||
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD
      ) {
        let isMatchUsage = true;
        if (dto.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY) {
          isMatchUsage = auth.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY;
        }
        if (dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD) {
          isMatchUsage = auth.codeUsage === AUTH_CODE_USAGE.FORGOT_PASSWORD;
        }
        const isCodeMatched = auth.code === dto.code;
        const isNotExpired = auth.codeExpiredAt > currentTimeStamp;
        const isValid = isMatchUsage && isCodeMatched && isNotExpired;
        if (!isValid) {
          const error = this.buildError(
            ERROR_CODE.AUTH_CODE_INVALID,
            `Invalid code`,
            400,
            'verifyAuth',
          );
          throw new UniteHttpException(error);
        }
      }
      // * STEP 4. CHANGE_PASSWORD
      if (
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD &&
        auth.codeUsage !== AUTH_CODE_USAGE.FORGOT_PASSWORD
      ) {
        const error = this.buildError(
          ERROR_CODE.AUTH_CODE_USAGE_NOW_ALLOW,
          `Usage not matched`,
          403,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      if (
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD &&
        !dto.newPassword
      ) {
        const error = this.buildError(
          ERROR_CODE.AUTH_PASSWORD_REQUIRED,
          `Password is required`,
          400,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      // * Update Data
      // * STEP A. Setup Transaction Session
      session.startTransaction();
      // * STEP B. Reset Auth State
      // TODO Typing
      const updateQuery: any = {
        codeExpiredAt: 0,
        code: '',
        codeUsage: AUTH_CODE_USAGE.NOT_SET,
        updatedAt: Date.now(),
      };
      if (auth.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY) {
        updateQuery.isIdentifierVerified = true;
      }
      if (
        auth.codeUsage === AUTH_CODE_USAGE.FORGOT_PASSWORD &&
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD
      ) {
        updateQuery.password = await this.encryptService.hashPassword(
          dto.newPassword,
        );
        updateQuery.lastChangedPasswordAt = currentTimeStamp;
      }
      const resetAuthState = await this.AuthModel.findByIdAndUpdate(
        auth._id,
        {
          $set: updateQuery,
        },
        { session: session },
      );
      assert.ok(resetAuthState, 'Auth State Reset');
      // * STEP C. Update User
      if (
        auth.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY &&
        auth.identifierType === AUTH_IDENTIFIER_TYPE.EMAIL
      ) {
        const updatedUser = await this.userService.updateEmailVerifiedById(
          `${auth.userId}`,
          session,
        );
        assert.ok(updatedUser, 'User EmailVerified Updated');
      }
      // * STEP D. Complete session
      await session.commitTransaction();
      await session.endSession();
      return {
        isDone: true,
      };
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async emailVerification(
    dto: AuthEmailVerificationDto,
    session?: ClientSession,
  ): Promise<IAuthVerifyRes> {
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      const currentTimeStamp = Date.now();
      // * STEP 1. Check Usage
      if (!EMAIL_VERIFICATION_ALLOW_AUTH_USAGE.includes(dto.usage)) {
        const error = this.buildError(
          ERROR_CODE.AUTH_CODE_USAGE_NOW_ALLOW,
          `${dto.usage} not allowed`,
          400,
          'emailVerification',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Get Current Auth
      const auth = await this.AuthModel.findOne({ identifier: dto.email });
      if (auth === null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.email} not exist`,
          404,
          'verifyAuth',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 3. Check Usage match with auth state
      if (auth.identifierType !== AUTH_IDENTIFIER_TYPE.EMAIL) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_TYPE_NOT_EMAIL,
          `Identifier of ${dto.email} is not email`,
          400,
          'emailVerification',
        );
        throw new UniteHttpException(error);
      }
      if (auth.codeExpiredAt > currentTimeStamp) {
        const EXPIRE_MIN = this.iamConfig.CODE_EXPIRE_MIN || 3;
        const error = this.buildError(
          ERROR_CODE.AUTH_CODE_EMAIL_RATE_LIMIT,
          `Identifier: ${dto.email} cannot send within ${EXPIRE_MIN} minute`,
          401,
          'emailVerification',
        );
        throw new UniteHttpException(error);
      }
      if (
        dto.usage === AUTH_CODE_USAGE.SIGN_UP_VERIFY &&
        auth.isIdentifierVerified
      ) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED,
          `Identifier: ${dto.email} already verified`,
          401,
          'emailVerification',
        );
        throw new UniteHttpException(error);
      }
      if (
        dto.usage === AUTH_CODE_USAGE.FORGOT_PASSWORD &&
        !auth.isIdentifierVerified
      ) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED,
          `Identifier: ${dto.email} not verified, cannot proceed ${dto.usage}`,
          403,
          'emailVerification',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 4. Setup Transaction Session
      session.startTransaction();
      const generated = this.authUtil.generateAuthCode();
      // * STEP 5. Send Email
      const mail: ISendMail = {
        to: dto.email,
        subject: `${dto.usage} 驗證碼`,
        text: generated.code,
        html: `<h1>驗證碼 : ${generated.code}</h1>`,
      };
      const sent = await this.mailService.send(mail);
      assert.ok(sent, 'Verify Email Sent');
      // * STEP 6. Update Auth State
      const updated = await this.AuthModel.findByIdAndUpdate(
        auth._id,
        {
          $set: {
            code: generated.code,
            codeExpiredAt: generated.codeExpiredAt,
            codeUsage: dto.usage,
            updatedAt: Date.now(),
          },
        },
        { session: session },
      );
      assert.ok(updated, 'Updated Auth');
      // * STEP 7. Complete session
      await session.commitTransaction();
      await session.endSession();
      return {
        isDone: true,
      };
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async emailSignIn(
    dto: AuthEmailSignInDto,
    session?: ClientSession,
  ): Promise<IAuthSignInRes> {
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Check email exist in both Auth and User
      const auth = await this.AuthModel.findOne({ identifier: dto.email });
      if (auth === null) {
        const error = this.buildError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.email} not found`,
          404,
          'emailSignIn',
        );
        throw new UniteHttpException(error);
      }
      const user = await this.userService.findByEmail(dto.email);
      if (user === null) {
        const error = this.buildError(
          ERROR_CODE.USER_NOT_FOUND,
          `User: ${dto.email} not found`,
          404,
          'emailSignIn',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Check is Identity Verified
      if (!auth.isIdentifierVerified) {
        const error = this.buildError(
          ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED,
          `Identifier: ${dto.email} not verified`,
          403,
          'emailSignIn',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. Check Auth sign in failed attempts
      const isLocked = this.authUtil.isExceedAttemptLimit(auth.toJSON());
      if (isLocked) {
        const error = this.buildError(
          ERROR_CODE.AUTH_SIGN_IN_FAILED_PER_HOUR_RATE_LIMIT,
          `Attempt rate limit, please try again after 1 hour`,
          406,
          'emailSignIn',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 3. Compare password => Record Fail
      const validPassword = await this.encryptService.comparePassword(
        dto.password,
        auth.password,
      );
      if (!validPassword) {
        // * STEP 3-1. Add FailRecord
        await this.pushFailedRecordItemById(auth._id, {
          signInMethod: AUTH_METHOD.EMAIL_PASSWORD,
          errorCode: ERROR_CODE.AUTH_PASSWORD_INVALID,
          ipAddress: '',
          failedPassword: dto.password,
          createdAt: Date.now(),
        });
        const error = this.buildError(
          ERROR_CODE.AUTH_PASSWORD_INVALID,
          `Invalid password`,
          403,
          'emailSignIn',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 4. Issue JWT
      const tokenResults = await this.authJwt.generateCustomToken(
        `${auth._id}`,
        user,
      );
      const aToken = this.authJwt.decode<IAuthDecodedToken>(
        tokenResults.accessToken,
      );
      const rToken = this.authJwt.decode<IAuthDecodedToken>(
        tokenResults.refreshToken,
      );
      // * STEP 5. Push into Auth
      session.startTransaction();
      const refreshItem: IAuthTokenItem = {
        type: AUTH_TOKEN_TYPE.REFRESH,
        provider: AUTH_PROVIDER.MONGOOSE,
        tokenId: tokenResults.refreshTokenId,
        tokenContent: tokenResults.refreshToken,
        issuer: rToken.iss,
        expiredAt: rToken.exp * 1000,
        createdAt: Date.now(),
      };
      const pushedRefreshItem = await this.pushRefreshTokenItemById(
        auth._id,
        refreshItem,
        session,
      );
      assert.ok(pushedRefreshItem, 'Pushed Refresh Token');
      const accessItem: IAuthTokenItem = {
        type: AUTH_TOKEN_TYPE.ACCESS,
        provider: AUTH_PROVIDER.MONGOOSE,
        tokenId: tokenResults.accessTokenId,
        tokenContent: tokenResults.accessToken,
        issuer: aToken.iss,
        expiredAt: aToken.exp * 1000,
        createdAt: Date.now(),
      };
      const pushedAccessItem = await this.pushAccessTokenItemById(
        auth._id,
        accessItem,
        session,
      );
      assert.ok(pushedAccessItem, 'Pushed Access Token');
      await session.commitTransaction();
      await session.endSession();
      return {
        accessToken: tokenResults.accessToken,
        refreshToken: tokenResults.refreshToken,
      };
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
        await session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async verifyRefreshToken(
    dto: AuthCheckRefreshTokenDto,
    returnDecodedToken = false,
  ): Promise<IAuthCheckResult> {
    try {
      const result: IAuthCheckResult = {
        isValid: false,
        message: 'Invalid token',
      };
      const token = await this.authJwt.verify<IAuthDecodedToken>(
        dto.token,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      if (!this.iamConfig.CHECK_REVOKED_TOKEN) {
        result.isValid = true;
        result.message = 'ok';
        if (returnDecodedToken) {
          result.decodedToken = token;
        }
        return result;
      }
      const notRevoked = await this.revokeService.check(
        token.sub,
        token.tokenId,
      );
      if (notRevoked) {
        result.isValid = true;
        result.message = 'ok';
        if (returnDecodedToken) {
          result.decodedToken = token;
        }
        return result;
      }
      result.isValid = false;
      result.message = 'Revoked token';
      return result;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async exchangeAccessToken(
    dto: AuthExchangeNewAccessTokenDto,
  ): Promise<IAuthExchangeNewAccessTokenRes> {
    try {
      const validResult = await this.verifyRefreshToken(
        {
          token: dto.token,
          type: AUTH_TOKEN_TYPE.REFRESH,
        },
        true,
      );
      if (validResult.isValid) {
        const user = await this.userService.findById(
          validResult.decodedToken.userId,
        );
        const userPayload: IUserTokenPayload =
          ExtractPropertiesFromObj<IUserTokenPayload>(
            user,
            this.iamConfig.JWT_PAYLOAD_PROPS_FROM_USER,
          );
        const aToken = await this.authJwt.sign(
          validResult.decodedToken.sub,
          validResult.decodedToken.userId,
          userPayload,
          AUTH_TOKEN_TYPE.ACCESS,
        );
        return {
          accessToken: aToken.token,
        };
      }
      const error = this.buildError(
        ERROR_CODE.AUTH_TOKEN_INVALID,
        `Invalid token`,
        403,
        'exchangeAccessToken',
      );
      throw new UniteHttpException(error);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async signOut(
    authId: string,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes> {
    if (!this.iamConfig.CHECK_REVOKED_TOKEN) {
      return {
        resultMessage: 'OK',
        isRevokedToken: false,
      };
    }
    try {
      // * Validate refresh token
      const token = await this.authJwt.verify<IAuthDecodedToken>(
        dto.token,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      await this.revokeService.insert(
        authId,
        token.tokenId,
        AUTH_REVOKED_TOKEN_SOURCE.USER_SIGN_OUT,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      return {
        resultMessage: 'OK',
        isRevokedToken: true,
      };
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
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
      const generated: IAuthGeneratedCode = this.authUtil.generateAuthCode();
      let authPassword = dto.password;
      if (hashPassword) {
        authPassword = await this.encryptService.hashPassword(authPassword);
      }
      const newAuth = await new this.AuthModel({
        ...dto,
        password: authPassword,
        code: resolveCode ? generated.code : '',
        codeExpiredAt: resolveCode ? generated.codeExpiredAt : 0,
      }).save({ session });
      const result: ICreateAuthResult = {
        identifierType: dto.identifierType,
        identifier: newAuth.identifier,
        code: newAuth.code,
        codeUsage: newAuth.codeUsage,
        codeExpiredAt: resolveCode ? generated.codeExpiredAt : 0,
      };
      return result;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private async pushFailedRecordItemById(
    authId: Types.ObjectId,
    item: IAuthSignInFailedRecordItem,
    session?: ClientSession,
  ): Promise<AuthDocument> {
    try {
      const SLICE_COUNT = 20;
      const updated = await this.AuthModel.findByIdAndUpdate(
        authId,
        {
          $push: {
            signInFailRecordList: {
              $each: [item],
              $slice: -SLICE_COUNT,
              $position: 0,
            },
          },
        },
        { session: session },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private async pushRefreshTokenItemById(
    authId: Types.ObjectId,
    item: IAuthTokenItem,
    session?: ClientSession,
  ): Promise<AuthDocument> {
    try {
      const SLICE_COUNT = 100;
      const updated = await this.AuthModel.findByIdAndUpdate(
        authId,
        {
          $push: {
            activeRefreshTokenList: {
              $each: [item],
              $slice: -SLICE_COUNT,
              $position: 0,
            },
          },
        },
        { session: session },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private async pushAccessTokenItemById(
    authId: Types.ObjectId,
    item: IAuthTokenItem,
    session?: ClientSession,
  ): Promise<AuthDocument> {
    try {
      const SLICE_COUNT = 100;
      const updated = await this.AuthModel.findByIdAndUpdate(
        authId,
        {
          $push: {
            accessTokenHistoryList: {
              $each: [item],
              $slice: -SLICE_COUNT,
              $position: 0,
            },
          },
        },
        { session: session },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
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
