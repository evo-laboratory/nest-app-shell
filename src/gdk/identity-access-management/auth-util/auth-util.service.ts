import {
  IAuthActivities,
  IAuthSignInFailedRecordItem,
} from '@gdk-iam/auth-activities/types';
import { IAuth, IAuthGeneratedCode } from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { MinToMilliseconds, RandomNumber } from '@shared/helper';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class AuthUtilService {
  private readonly Logger = new Logger(AuthUtilService.name);
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
  ) {}
  @MethodLogger()
  public generateAuthCode(): IAuthGeneratedCode {
    const code = RandomNumber();
    const EXPIRE_MIN = this.iamConfig.CODE_EXPIRE_MIN || 3;
    this.Logger.verbose(EXPIRE_MIN, 'generateAuthCode.EXPIRE_MIN');
    const expiredAt = Date.now() + MinToMilliseconds(EXPIRE_MIN);
    return {
      code: code,
      codeExpiredAt: new Date(expiredAt),
    };
  }

  @MethodLogger()
  public checkAuthAllowSignIn(
    identifier: string,
    auth: IAuth,
    authActivities: IAuthActivities,
    skipCheckExceedLimit = false,
  ): true {
    this.Logger.verbose(identifier, 'checkAuthAllowSignIn(identifier)');
    this.Logger.verbose(
      skipCheckExceedLimit,
      'checkAuthAllowSignIn(skipCheckExceedLimit)',
    );
    // * Always return true, throw error inside.
    // * STEP 1A. Check Existence
    if (auth === null) {
      this.throwHttpError(
        ERROR_CODE.AUTH_NOT_FOUND,
        `Identifier: ${identifier} not found`,
        404,
        'emailSignIn',
      );
    }
    this.Logger.verbose('STEP 1A. Pass', 'checkAuthAllowSignIn');
    // * STEP 1B. Check is Identity Verified
    if (!auth.isIdentifierVerified) {
      this.throwHttpError(
        ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED,
        `Identifier: ${identifier} not verified`,
        403,
        'emailSignIn',
      );
    }
    this.Logger.verbose('STEP 1B. Pass', 'checkAuthAllowSignIn');
    // * STEP 1C. Check is active
    if (!auth.isActivated) {
      this.throwHttpError(
        ERROR_CODE.AUTH_INACTIVE,
        `Auth inactive, cannot sign in`,
        403,
        'emailSignIn',
      );
    }
    this.Logger.verbose('STEP 1C. Pass', 'checkAuthAllowSignIn');
    // * STEP 1D. Check Auth sign in failed attempts
    if (!skipCheckExceedLimit && authActivities !== null) {
      const isLocked = this.isExceedAttemptLimit(auth, authActivities);
      if (isLocked) {
        this.throwHttpError(
          ERROR_CODE.AUTH_SIGN_IN_FAILED_PER_HOUR_RATE_LIMIT,
          `Attempt rate limit, please try again after 1 hour`,
          406,
          'emailSignIn',
        );
      }
      this.Logger.verbose('STEP 1D. Pass', 'checkAuthAllowSignIn');
    }
    return true;
  }

  @MethodLogger()
  public isExceedAttemptLimit(
    auth: IAuth,
    authActivities: IAuthActivities,
  ): boolean {
    const LOCK_ATTEMPT_EXCEED =
      this.iamConfig.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED;
    this.Logger.verbose(
      LOCK_ATTEMPT_EXCEED,
      'isExceedAttemptLimit.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED',
    );
    if (!LOCK_ATTEMPT_EXCEED) {
      return false;
    }
    // * If Failed more than SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT times within 1hour, stop it.
    const ATTEMPT_LIMIT =
      this.iamConfig.SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT || 5;
    const currentTimeStamp = Date.now();
    const startingTimeStamp = LOCK_ATTEMPT_EXCEED
      ? currentTimeStamp
      : new Date(auth.lastChangedPasswordAt).getTime();
    const hourAgo = startingTimeStamp - 3600000;
    const recentFailAttempts = authActivities.signInFailRecordList.filter(
      (record: IAuthSignInFailedRecordItem) => {
        const recordCreatedAtTimestamp = new Date(record.createdAt).getTime();
        const lastChangedPasswordAtTimestamp = new Date(
          auth.lastChangedPasswordAt,
        ).getTime();
        if (lastChangedPasswordAtTimestamp > recordCreatedAtTimestamp) {
          // * Ignore failed record before lastChangedPasswordAt
          return false;
        } else {
          return recordCreatedAtTimestamp > hourAgo;
        }
      },
    );
    this.Logger.verbose(
      recentFailAttempts.length,
      'isExceedAttemptLimit.recentFailAttempts',
    );
    if (recentFailAttempts.length >= ATTEMPT_LIMIT) {
      this.Logger.verbose(ATTEMPT_LIMIT, 'isExceedAttemptLimit.ATTEMPT_LIMIT');
      return true;
    }
    console.log(recentFailAttempts.length);
    console.log(ATTEMPT_LIMIT);
    return false;
  }

  @MethodLogger()
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
      contextName: 'AuthUtilService',
      methodName: `${methodName}`,
    };
    throw new UniteHttpException(errorObj);
  }
}
