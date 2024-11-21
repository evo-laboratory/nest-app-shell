import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigType } from '@nestjs/config';
import { ClientSession, Connection, Model } from 'mongoose';
import { strict as assert } from 'assert';
import { AuthService } from '@gdk-iam/auth/auth.service';
import { AuthUtilService } from '@gdk-iam/auth-util/auth-util.service';
import { AuthJwtService } from '@gdk-iam/auth-jwt/auth-jwt.service';
import { MailService } from '@gdk-mail/mail.service';
import { UserService } from '@gdk-iam/user/user.service';
import { EncryptService } from '@gdk-iam/encrypt/encrypt.service';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { OauthClientService } from '@gdk-iam/oauth-client/oauth-client.service';

import {
  IEmailSignUpRes,
  IAuthVerifyRes,
  IAuthGeneratedCode,
  IAuthSignInRes,
  IAuthDecodedToken,
  IAuthCheckResult,
  IAuthExchangeNewAccessTokenRes,
  IAuthCreateAuthWithUser,
  IAuthCreateAuthWithUserRes,
  IAuth,
  IAuthGenerateCustomTokenResult,
  IAuthFlexUpdate,
  IAuthDataResponse,
} from '@gdk-iam/auth/types';
import {
  AuthCheckRefreshTokenDto,
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthExchangeNewAccessTokenDto,
  AuthSocialSignInUpDto,
  AuthVerifyDto,
  EmailSignUpDto,
} from '@gdk-iam/auth/dto';
import { ISendMail } from '@gdk-mail/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { IUser, IUserTokenPayload } from '@gdk-iam/user/types';

import {
  ExtractPropertiesFromObj,
  GetResponseWrap,
  JsonStringify,
} from '@shared/helper';
import { MethodLogger } from '@shared/winston-logger';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { IGetResponseWrapper } from '@shared/types';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import {
  GetOptionsMongooseQueryMapper,
  ListOptionsMongooseQueryMapper,
  MongoDBErrorHandler,
} from '@shared/mongodb';

import { AuthActivitiesService } from '@gdk-iam/auth-activities/auth-activities.service';
import { IAuthTokenItem } from '@gdk-iam/auth-activities/types';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_METHOD,
  AUTH_PROVIDER,
  AUTH_TOKEN_TYPE,
} from '@gdk-iam/auth/enums';
import {
  AUTH_MODEL_NAME,
  EMAIL_VERIFICATION_ALLOW_AUTH_USAGE,
} from '@gdk-iam/auth/statics';
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/enums';

import { Auth } from './auth.schema';
@Injectable()
export class AuthMongooseService implements AuthService {
  private readonly Logger = new Logger(AuthMongooseService.name);
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
    private readonly authActivities: AuthActivitiesService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly encryptService: EncryptService,
    private readonly revokeService: AuthRevokedTokenService,
    private readonly oauthClientService: OauthClientService,
  ) {}

  @MethodLogger()
  public async emailSignUp(
    dto: EmailSignUpDto,
    isAlreadyVerified = false,
    session?: ClientSession,
  ): Promise<IEmailSignUpRes> {
    this.Logger.verbose(JsonStringify(dto), 'emailSignUp(dto)');
    this.Logger.verbose(isAlreadyVerified, 'emailSignUp(isAlreadyVerified)');
    this.Logger.verbose(session ? true : false, 'emailSignUp(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Check Email Existence(Both Auth And User)
      const checkUserEmail = await this.userService.findByEmail(dto.email);
      if (checkUserEmail !== null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_EMAIL_EXIST,
          `Email: ${dto.email} already existed`,
          400,
          'emailSignUp.checkUserEmail',
        );
      }
      const checkAuthIdentifier = await this.AuthModel.findOne({
        identifier: dto.email,
      });
      if (checkAuthIdentifier !== null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_IDENTIFIER_EXIST,
          `Identifier: ${dto.email} already existed`,
          400,
          'emailSignUp.checkAuthIdentifier',
        );
      }
      // * STEP 2. Setup Transaction Session
      session.startTransaction();
      const createDto: IAuthCreateAuthWithUser = {
        identifierType: AUTH_IDENTIFIER_TYPE.EMAIL,
        googleSignInId: '',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName
          ? dto.displayName
          : `${dto.firstName} ${dto.lastName}`,
        signUpMethod: AUTH_METHOD.EMAIL_PASSWORD,
        password: dto.password,
        codeUsage: AUTH_CODE_USAGE.SIGN_UP_VERIFY,
        isManualVerified: isAlreadyVerified,
      };
      // * STEP 3. Create New User and New Auth
      const setup = await this.createWithUser(createDto, true, true, session);
      this.Logger.verbose(JsonStringify(setup), 'emailSignUp.setup');
      // * STEP 5. Send Email
      if (!isAlreadyVerified) {
        const mail: ISendMail = {
          to: dto.email,
          subject: '註冊驗證碼',
          text: setup.newAuth.code,
          html: `<h1>驗證碼 : ${setup.newAuth.code}</h1>`,
        };
        const sent = await this.mailService.send(mail);
        assert.ok(sent, 'Verify Email Sent');
      }
      // * STEP 6. Complete session
      await session.commitTransaction();
      await session.endSession();
      const res: IEmailSignUpRes = {
        email: dto.email,
        isEmailSent: isAlreadyVerified ? false : true,
        canResendAt: isAlreadyVerified ? null : setup.newAuth.codeExpiredAt,
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
  public async socialEmailSignInUp(
    dto: AuthSocialSignInUpDto,
    session?: ClientSession,
  ): Promise<IAuthSignInRes> {
    this.Logger.verbose(JsonStringify(dto), 'socialEmailSignInUp(dto)');
    this.Logger.verbose(session ? true : false, 'socialEmailSignInUp(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Verify from OAuthClient
      const oauthUser = await this.oauthClientService.socialAuthenticate(dto);
      this.Logger.verbose(
        JsonStringify(oauthUser),
        'socialEmailSignInUp.oauthUser',
      );
      let user: IUser;
      let auth: IAuth;
      session.startTransaction();
      // * STEP 3. Check Auth
      auth = await this.AuthModel.findOne({
        identifier: oauthUser.email,
      }).lean();
      const authJson = auth === null ? null : auth;
      if (auth !== null) {
        // * STEP 3A. Already have auth, check allow Sign In
        const authActivities = await this.authActivities.getByAuthId(
          `${auth._id}`,
        );
        this.authUtil.checkAuthAllowSignIn(
          oauthUser.email,
          authJson,
          authActivities,
        );
        // * STEP 3B. Check User
        user = await this.userService.findByEmail(oauthUser.email);
        if (user === null) {
          this.throwHttpError(
            ERROR_CODE.USER_NOT_FOUND,
            `User: ${oauthUser.email} not found`,
            404,
            'socialEmailSignInUp',
          );
        }
        // * STEP 4. Auth Data matchup
        const updateAuth: IAuthFlexUpdate = {};
        if (dto.method === AUTH_METHOD.GOOGLE_SIGN_IN && !auth.googleSignInId) {
          updateAuth.googleSignInId = oauthUser.sub;
          updateAuth.updatedAt = new Date();
        }
        if (Object.keys(updateAuth).length > 0) {
          const newMethod = [];
          if (
            dto.method === AUTH_METHOD.GOOGLE_SIGN_IN &&
            !auth.googleSignInId
          ) {
            newMethod.push(AUTH_METHOD.GOOGLE_SIGN_IN);
          }
          const updatedAuth = await this.AuthModel.findByIdAndUpdate(
            auth._id,
            {
              $set: updateAuth,
              $push: {
                signUpMethodList: {
                  $each: newMethod,
                },
              },
            },
            { session: session },
          );
          this.Logger.verbose(
            JsonStringify(updatedAuth),
            'socialEmailSignInUp.updatedAuth',
          );
          assert.ok(updatedAuth, 'Updated Auth');
        }
      } else {
        // * STEP 3C. Create New Auth
        const createDto: IAuthCreateAuthWithUser = {
          identifierType: AUTH_IDENTIFIER_TYPE.EMAIL,
          googleSignInId: oauthUser.sub,
          email: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          displayName: oauthUser.displayName,
          signUpMethod: AUTH_METHOD.GOOGLE_SIGN_IN,
          password: '',
          codeUsage: AUTH_CODE_USAGE.NOT_SET,
          isManualVerified: true,
        };
        // * STEP 4. Create New User and New Auth
        const setup = await this.createWithUser(
          createDto,
          false,
          false,
          session,
        );
        this.Logger.verbose(JsonStringify(setup), 'socialEmailSignInUp.setup');
        user = setup.newUser;
        auth = setup.newAuth;
      }
      // * STEP 5. Issue JWT
      const tokenResults = await this.issueJWTAndRecord(auth, user, session);
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
  public async verifyAuth(
    dto: AuthVerifyDto,
    session?: ClientSession,
  ): Promise<IAuthVerifyRes> {
    this.Logger.verbose(JsonStringify(dto), 'verifyAuth(dto)');
    this.Logger.verbose(session ? true : false, 'verifyAuth(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      const currentTimeStamp = Date.now();
      // * STEP 1. Get Current Auth
      const auth = await this.AuthModel.findOne({ identifier: dto.identifier });
      if (auth === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.identifier} not exist`,
          404,
          'verifyAuth',
        );
      }
      // * STEP 2. Check User Exist
      const user = await this.userService.getById(`${auth.userId}`, {}, true);
      if (user.data === null) {
        this.throwHttpError(
          ERROR_CODE.USER_NOT_FOUND,
          `User not exist`,
          404,
          'verifyAuth',
        );
      }
      // * STEP 2. Check if already verified
      if (
        dto.codeUsage === AUTH_CODE_USAGE.SIGN_UP_VERIFY &&
        auth.isIdentifierVerified
      ) {
        this.throwHttpError(
          ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED,
          `Identifier: ${dto.identifier} already verified`,
          401,
          'verifyAuth',
        );
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
        const isNotExpired = auth.codeExpiredAt.getTime() > currentTimeStamp;
        const isValid = isMatchUsage && isCodeMatched && isNotExpired;
        if (!isValid) {
          this.throwHttpError(
            ERROR_CODE.AUTH_CODE_INVALID,
            `Invalid code`,
            400,
            'verifyAuth',
          );
        }
      }
      // * STEP 4. CHANGE_PASSWORD
      if (
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD &&
        auth.codeUsage !== AUTH_CODE_USAGE.FORGOT_PASSWORD
      ) {
        this.throwHttpError(
          ERROR_CODE.AUTH_CODE_USAGE_NOW_ALLOW,
          `Usage not matched`,
          403,
          'verifyAuth',
        );
      }
      if (
        dto.codeUsage === AUTH_CODE_USAGE.CHANGE_PASSWORD &&
        !dto.newPassword
      ) {
        this.throwHttpError(
          ERROR_CODE.AUTH_PASSWORD_REQUIRED,
          `Password is required`,
          400,
          'verifyAuth',
        );
      }
      // * Update Data
      // * STEP A. Setup Transaction Session
      session.startTransaction();
      // * STEP B. Reset Auth State
      const updateQuery: IAuthFlexUpdate = {
        codeExpiredAt: null,
        code: '',
        codeUsage: AUTH_CODE_USAGE.NOT_SET,
        updatedAt: new Date(),
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
        updateQuery.lastChangedPasswordAt = new Date();
      }
      this.Logger.verbose(JsonStringify(updateQuery), 'verifyAuth.updateQuery');
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
    this.Logger.verbose(JsonStringify(dto), 'emailVerification(dto)');
    this.Logger.verbose(session ? true : false, 'emailVerification(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      const currentTimeStamp = Date.now();
      // * STEP 1. Check Usage
      if (!EMAIL_VERIFICATION_ALLOW_AUTH_USAGE.includes(dto.usage)) {
        this.throwHttpError(
          ERROR_CODE.AUTH_CODE_USAGE_NOW_ALLOW,
          `${dto.usage} not allowed`,
          400,
          'emailVerification',
        );
      }
      // * STEP 2. Get Current Auth
      const auth = await this.AuthModel.findOne({ identifier: dto.email });
      if (auth === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.email} not exist`,
          404,
          'verifyAuth',
        );
      }
      // * STEP 3. Check Usage match with auth state
      if (auth.identifierType !== AUTH_IDENTIFIER_TYPE.EMAIL) {
        this.throwHttpError(
          ERROR_CODE.AUTH_IDENTIFIER_TYPE_NOT_EMAIL,
          `Identifier of ${dto.email} is not email`,
          400,
          'emailVerification',
        );
      }
      if (auth.codeExpiredAt.getTime() > currentTimeStamp) {
        const EXPIRE_MIN = this.iamConfig.CODE_EXPIRE_MIN || 3;
        this.throwHttpError(
          ERROR_CODE.AUTH_CODE_EMAIL_RATE_LIMIT,
          `Identifier: ${dto.email} cannot send within ${EXPIRE_MIN} minute`,
          401,
          'emailVerification',
        );
      }
      if (
        dto.usage === AUTH_CODE_USAGE.SIGN_UP_VERIFY &&
        auth.isIdentifierVerified
      ) {
        this.throwHttpError(
          ERROR_CODE.AUTH_IDENTIFIER_ALREADY_VERIFIED,
          `Identifier: ${dto.email} already verified`,
          401,
          'emailVerification',
        );
      }
      if (
        dto.usage === AUTH_CODE_USAGE.FORGOT_PASSWORD &&
        !auth.isIdentifierVerified
      ) {
        this.throwHttpError(
          ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED,
          `Identifier: ${dto.email} not verified, cannot proceed ${dto.usage}`,
          403,
          'emailVerification',
        );
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
            updatedAt: new Date(),
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
    this.Logger.verbose(JsonStringify(dto), 'emailSignIn(dto)');
    this.Logger.verbose(session ? true : false, 'emailSignIn(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Check Auth
      const auth = await this.AuthModel.findOne({ identifier: dto.email });
      const authJson = auth === null ? null : auth.toJSON();
      if (auth === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Identifier: ${dto.email} not found`,
          404,
          'emailSignIn',
        );
      }
      const authActivities = await this.authActivities.getByAuthId(
        `${auth._id}`,
      );
      // * Always return true, throw error inside
      this.authUtil.checkAuthAllowSignIn(dto.email, authJson, authActivities);
      // * STEP 2. Check User
      const user = await this.userService.findByEmail(dto.email);
      if (user === null) {
        this.throwHttpError(
          ERROR_CODE.USER_NOT_FOUND,
          `User: ${dto.email} not found`,
          404,
          'emailSignIn',
        );
      }
      // * STEP 3. Compare password => Record Fail
      const validPassword = await this.encryptService.comparePassword(
        dto.password,
        auth.password,
      );
      if (!validPassword) {
        // * STEP 3-1. Add FailRecord
        await this.authActivities.pushFailedRecordItemByAuthId(`${auth._id}`, {
          signInMethod: AUTH_METHOD.EMAIL_PASSWORD,
          errorCode: ERROR_CODE.AUTH_PASSWORD_INVALID,
          ipAddress: '',
          failedPassword: dto.password,
          createdAt: new Date(),
        });
        this.throwHttpError(
          ERROR_CODE.AUTH_PASSWORD_INVALID,
          `Invalid password`,
          403,
          'emailSignIn',
        );
      }
      // * STEP 4. Issue JWT
      session.startTransaction();
      const tokenResults = await this.issueJWTAndRecord(
        authJson,
        user,
        session,
      );
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
    this.Logger.verbose(JsonStringify(dto), 'verifyRefreshToken(dto)');
    this.Logger.verbose(
      returnDecodedToken,
      'verifyRefreshToken(returnDecodedToken)',
    );
    try {
      const result: IAuthCheckResult = {
        isValid: false,
        message: 'Invalid token',
      };
      const token = await this.authJwt.verify<IAuthDecodedToken>(
        dto.token,
        AUTH_TOKEN_TYPE.REFRESH,
      );
      const auth = await this.AuthModel.findById(token.sub);
      this.authUtil.checkAuthAllowSignIn(token.email, auth, null, true);
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
    this.Logger.verbose(JsonStringify(dto), 'exchangeAccessToken(dto)');
    try {
      // TODO ADD checkAuthAllowSignIn
      const validResult = await this.verifyRefreshToken(
        {
          token: dto.token,
          type: AUTH_TOKEN_TYPE.REFRESH,
        },
        true,
      );
      if (validResult.isValid) {
        const user = await this.userService.getById(
          validResult.decodedToken.userId,
          {},
          false,
        );
        const userPayload: IUserTokenPayload =
          ExtractPropertiesFromObj<IUserTokenPayload>(
            user,
            this.iamConfig.JWT_PAYLOAD_PROPS_FROM_USER,
          );
        this.Logger.verbose(
          JsonStringify(userPayload),
          'exchangeAccessToken.userPayload',
        );
        const signed = await this.authJwt.sign(
          validResult.decodedToken.sub,
          validResult.decodedToken.userId,
          userPayload,
          AUTH_TOKEN_TYPE.ACCESS,
        );
        const aToken = this.authJwt.decode<IAuthDecodedToken>(signed.token);
        const accessItem: IAuthTokenItem = {
          type: AUTH_TOKEN_TYPE.ACCESS,
          provider: AUTH_PROVIDER.MONGOOSE,
          tokenId: signed.tokenId,
          tokenContent: signed.token,
          issuer: aToken.iss,
          expiredAt: new Date(aToken.exp * 1000),
          createdAt: new Date(),
        };
        await this.authActivities.pushTokenItemByAuthId(
          validResult.decodedToken.sub,
          [accessItem],
        );
        return {
          accessToken: signed.token,
        };
      }
      this.throwHttpError(
        ERROR_CODE.AUTH_TOKEN_INVALID,
        `Invalid token`,
        403,
        'exchangeAccessToken',
      );
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IAuth[]>> {
    try {
      const mappedOpts = ListOptionsMongooseQueryMapper(opt);
      this.Logger.verbose(JsonStringify(mappedOpts), 'listAll(mappedOpts)');
      const data = await this.AuthModel.find(mappedOpts.filterObjs)
        .sort(mappedOpts.sortObjs)
        .populate(mappedOpts.populateFields)
        .select(mappedOpts.selectedFields)
        .skip(mappedOpts.skip)
        .limit(mappedOpts.limit)
        .lean();
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async getById(
    id: string,
    opt: GetOptionsDto,
    canBeNull = true,
  ): Promise<IAuthDataResponse> {
    try {
      this.Logger.verbose(id, 'getById(id)');
      this.Logger.verbose(canBeNull, 'getById(canBeNull)');
      const mappedOpts = GetOptionsMongooseQueryMapper(opt);
      this.Logger.verbose(JsonStringify(mappedOpts), 'getById(mappedOpts)');
      const data = await this.AuthModel.findById(id)
        .select(mappedOpts.selectedFields)
        .populate(mappedOpts.populateFields)
        .lean();
      if (data === null && !canBeNull) {
        // * Throw 404
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Not found`,
          404,
          'getById',
        );
      }
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getByEmail(
    email: string,
    opt: GetOptionsDto,
    canBeNull = true,
  ): Promise<IAuthDataResponse> {
    this.Logger.verbose(email, 'getByEmail(email)');
    this.Logger.verbose(canBeNull, 'getByEmail(canBeNull)');
    const mappedOpts = GetOptionsMongooseQueryMapper(opt);
    this.Logger.verbose(JsonStringify(mappedOpts), 'getByEmail(mappedOpts)');
    try {
      const data = await this.AuthModel.findOne({
        identifier: email,
        identifierType: AUTH_IDENTIFIER_TYPE.EMAIL,
      })
        .select(mappedOpts.selectedFields)
        .populate(mappedOpts.populateFields)
        .lean();
      if (data === null && !canBeNull) {
        // * Throw 404
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Not found`,
          404,
          'getByEmail',
        );
      }
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getByIdentifier(
    email: string,
    opt: GetOptionsDto,
    canBeNull = true,
  ): Promise<IAuthDataResponse> {
    this.Logger.verbose(email, 'getByIdentifier(email)');
    this.Logger.verbose(canBeNull, 'getByIdentifier(canBeNull)');
    const mappedOpts = GetOptionsMongooseQueryMapper(opt);
    this.Logger.verbose(
      JsonStringify(mappedOpts),
      'getByIdentifier(mappedOpts)',
    );
    try {
      const data = await this.AuthModel.findOne({
        identifier: email,
      })
        .select(mappedOpts.selectedFields)
        .populate(mappedOpts.populateFields)
        .lean();
      if (data === null && !canBeNull) {
        // * Throw 404
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Not found`,
          404,
          'getByIdentifier',
        );
      }
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async activateById(
    authId: string,
    session?: ClientSession,
  ): Promise<IAuthDataResponse> {
    this.Logger.verbose(authId, 'activateById(authId)');
    this.Logger.verbose(session ? true : false, 'activateById(session)');
    try {
      // * STEP 1. Check if already activated
      const check = await this.AuthModel.findById(authId);
      this.Logger.verbose(check === null, 'activateById.check is null or not');
      if (check === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Auth: ${authId} not found`,
          404,
          'deactivateById',
        );
      }
      if (check.isActivated) {
        this.throwHttpError(
          ERROR_CODE.AUTH_ALREADY_ACTIVATED,
          `Auth: ${authId} already activated`,
          400,
          'activateById',
        );
      }
      const activated = await this.AuthModel.findByIdAndUpdate(
        authId,
        {
          $set: {
            isActivated: true,
            inactivatedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session: session, new: true },
      );
      return GetResponseWrap(activated);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async deactivateById(
    authId: string,
    session?: ClientSession,
  ): Promise<IAuthDataResponse> {
    this.Logger.verbose(authId, 'deactivateById(authId)');
    let _session: ClientSession;
    if (!session) {
      _session = await this.connection.startSession();
      this.Logger.verbose(
        'Upstream not passed in session, started new session',
        'deactivateById(session)',
      );
    } else {
      this.Logger.verbose(
        'Upstream passed in session',
        'deactivateById(session)',
      );
      _session = session;
    }
    try {
      // * STEP 1. Check if already disabled
      const check = await this.AuthModel.findById(authId);
      this.Logger.verbose(
        check === null,
        'deactivateById.check is null or not',
      );
      if (check === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Auth: ${authId} not found`,
          404,
          'deactivateById',
        );
      }
      if (!check.isActivated) {
        this.throwHttpError(
          ERROR_CODE.AUTH_ALREADY_DEACTIVATED,
          `Auth: ${authId} already deactivated`,
          400,
          'deactivateById',
        );
      }
      if (!session) {
        _session.startTransaction();
      }
      // * STEP 2. Disable Auth
      const deactivated = await this.AuthModel.findByIdAndUpdate(
        authId,
        {
          $set: {
            isActivated: false,
            inactivatedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session: _session, new: true },
      );
      assert.ok(deactivated, 'Deactivated Auth');
      // * STEP 3. Get All Tokens and Revoke
      const authActivities = await this.authActivities.getByAuthId(authId);
      // * authActivities is possible null, because user may not have login before, thus no tokens
      if (
        authActivities !== null &&
        authActivities.refreshTokenList.length > 0
      ) {
        this.Logger.verbose(
          authActivities.refreshTokenList.length,
          'deactivateById.authActivities.length',
        );
        const revokeAllTokens = await Promise.all(
          authActivities.refreshTokenList.map(
            async (item) =>
              await this.revokeService.insert(
                authId,
                item.tokenId,
                AUTH_REVOKED_TOKEN_SOURCE.ADMIN,
                AUTH_TOKEN_TYPE.REFRESH,
                true,
                _session,
              ),
          ),
        );
        assert.ok(
          revokeAllTokens.length === authActivities.refreshTokenList.length,
          `Revoked ${revokeAllTokens.length} tokens should be equal to ${authActivities.refreshTokenList.length}`,
        );
        // * STEP 4. Clear refreshTokens in AuthActivities
        const cleared = await this.authActivities.clearTokenListByAuthId(
          authId,
          false,
          AUTH_TOKEN_TYPE.REFRESH,
          _session,
        );
        assert.ok(cleared, 'Cleared RefreshTokens in AuthActivities');
      }
      // * STEP 5. Complete session
      if (!session) {
        await _session.commitTransaction();
        await _session.endSession();
      }
      return GetResponseWrap(deactivated);
    } catch (error) {
      if (_session.inTransaction()) {
        await _session.abortTransaction();
        await _session.endSession();
      }
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async deleteById(
    id: string,
    isSelfDelete = false,
    session?: ClientSession,
  ): Promise<IAuthDataResponse> {
    this.Logger.verbose(id, 'deleteById(id)');
    this.Logger.verbose(isSelfDelete, 'deleteById(isSelfDelete)');
    this.Logger.verbose(session ? true : false, 'deleteById(session)');
    if (!session) {
      session = await this.connection.startSession();
    }
    try {
      // * STEP 1. Check if already deleted
      const check = await this.AuthModel.findById(id);
      if (check === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Auth: ${id} not found`,
          404,
          'deleteById',
        );
      }
      session.startTransaction();
      // * STEP 2. Deactivate Auth
      const auth = await this.AuthModel.findById(id);
      if (auth.isActivated) {
        this.Logger.verbose(
          'Auth is activated, deactivate first',
          'deleteById',
        );
        const deactivated = await this.deactivateById(id, session);
        assert.ok(deactivated, 'Deactivated Auth');
      }
      // * STEP 3. Delete Auth Activities
      const checkAuthActivities = await this.authActivities.getByAuthId(id);
      if (checkAuthActivities !== null) {
        this.Logger.verbose(
          'AuthActivities found, user not login before',
          'deleteById',
        );
        const deletedActivities = await this.authActivities.deleteByAuthId(
          id,
          session,
        );
        assert.ok(deletedActivities, 'Deleted Auth Activities');
      }
      // * STEP 4. Deleted Auth
      const deleted = await this.AuthModel.findByIdAndDelete(id, {
        session: session,
        new: true,
      });
      if (deleted === null) {
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Auth: ${id} not found`,
          404,
          'deleteById',
        );
      }
      assert.ok(deleted, 'Deleted Auth');
      const checkUser = await this.userService.getById(
        `${deleted.userId}`,
        {},
        true,
      );
      if (checkUser !== null) {
        if (isSelfDelete && !this.iamConfig.SELF_HARD_DELETE_ENABLED) {
          this.Logger.verbose(
            'Soft Delete User',
            'deleteById.checkSoftDeleteOrHardDelete',
          );
          const softDeletedUser = await this.userService.selfDeleteById(
            `${deleted.userId}`,
            auth,
            session,
          );
          assert.ok(softDeletedUser, 'Soft Deleted User');
        } else {
          this.Logger.verbose(
            'Hard Delete User',
            'deleteById.checkSoftDeleteOrHardDelete',
          );
          const hardDeletedUser = await this.userService.deleteById(
            `${deleted.userId}`,
            session,
          );
          assert.ok(hardDeletedUser, 'Hard Deleted User');
        }
      } else {
        this.Logger.warn(
          `User: ${deleted.userId} not found, data inconsistent.`,
          'deleteById.checkUser',
        );
      }
      await session.commitTransaction();
      await session.endSession();
      return GetResponseWrap(deleted);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private async createWithUser(
    dto: IAuthCreateAuthWithUser,
    hashPassword = true,
    resolveCode = true,
    session?: ClientSession,
  ): Promise<IAuthCreateAuthWithUserRes> {
    this.Logger.verbose(JsonStringify(dto), 'createWithUser(dto)');
    this.Logger.verbose(hashPassword, 'createWithUser(hashPassword)');
    this.Logger.verbose(resolveCode, 'createWithUser(resolveCode)');
    this.Logger.verbose(
      session ? true : false,
      'pushAccessTokenItemById(session)',
    );
    try {
      const generated: IAuthGeneratedCode = this.authUtil.generateAuthCode();
      let authPassword = dto.password;
      if (hashPassword) {
        authPassword = await this.encryptService.hashPassword(authPassword);
      }
      const newUser = await this.userService.create(
        {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: dto.displayName,
          isEmailVerified: dto.isManualVerified ? true : false,
        },
        session,
      );
      assert.ok(newUser, 'New User Created');
      const newAuth = await new this.AuthModel({
        googleSignInId: dto.googleSignInId,
        identifierType: dto.identifierType,
        identifier: dto.email,
        provider: AUTH_PROVIDER.MONGOOSE,
        signUpMethodList: [dto.signUpMethod],
        userId: newUser._id,
        password: authPassword,
        code: resolveCode ? generated.code : '',
        codeExpiredAt: resolveCode ? generated.codeExpiredAt : 0,
        codeUsage: dto.codeUsage,
        isIdentifierVerified: dto.isManualVerified ? true : false,
      }).save({ session });
      assert.ok(newAuth, 'New Auth Created');
      const authJson = newAuth.toJSON();
      return {
        newUser,
        newAuth: authJson,
      };
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  private async issueJWTAndRecord(
    auth: IAuth,
    user: IUser,
    session: ClientSession,
  ): Promise<IAuthGenerateCustomTokenResult> {
    // TODO Review this method usage, could be improved / refactored to better structure
    this.Logger.verbose(auth._id, 'issueJWTAndRecord(auth._id)');
    this.Logger.verbose(user._id, 'issueJWTAndRecord(user._id)');
    this.Logger.verbose(session ? true : false, 'issueJWTAndRecord(session)');
    try {
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
      const refreshItem: IAuthTokenItem = {
        type: AUTH_TOKEN_TYPE.REFRESH,
        provider: AUTH_PROVIDER.MONGOOSE,
        tokenId: tokenResults.refreshTokenId,
        tokenContent: tokenResults.refreshToken,
        issuer: rToken.iss,
        expiredAt: new Date(rToken.exp * 1000),
        createdAt: new Date(),
      };
      const accessItem: IAuthTokenItem = {
        type: AUTH_TOKEN_TYPE.ACCESS,
        provider: AUTH_PROVIDER.MONGOOSE,
        tokenId: tokenResults.accessTokenId,
        tokenContent: tokenResults.accessToken,
        issuer: aToken.iss,
        expiredAt: new Date(aToken.exp * 1000),
        createdAt: new Date(),
      };
      const pushedBothItems = await this.authActivities.pushTokenItemByAuthId(
        `${auth._id}`,
        [accessItem, refreshItem],
        session,
      );
      assert.ok(pushedBothItems, 'Pushed Both Tokens');
      return tokenResults;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  private throwHttpError(
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
    throw new UniteHttpException(errorObj);
  }
}
