import {
  IAuth,
  IAuthGeneratedCode,
  IAuthSignInFailedRecordItem,
} from '@gdk-iam/auth/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import { Inject, Injectable } from '@nestjs/common';
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
    const expiredAt = Date.now() + MinToMilliseconds(EXPIRE_MIN);
    return {
      code: code,
      codeExpiredAt: expiredAt,
    };
  }

  @MethodLogger()
  public checkAuthAllowSignIn(identifier: string, auth: IAuth): true {
    // * Always return true, throw error inside.
    // * STEP 1A. Check Existence
    if (auth === null) {
      const error = this.buildError(
        ERROR_CODE.AUTH_NOT_FOUND,
        `Identifier: ${identifier} not found`,
        404,
        'emailSignIn',
      );
      throw new UniteHttpException(error);
    }
    // * STEP 1B. Check is Identity Verified
    if (!auth.isIdentifierVerified) {
      const error = this.buildError(
        ERROR_CODE.AUTH_IDENTIFIER_NOT_VERIFIED,
        `Identifier: ${identifier} not verified`,
        403,
        'emailSignIn',
      );
      throw new UniteHttpException(error);
    }
    // * STEP 1C. Check is active
    if (!auth.isActive) {
      // TODO NOT TESTED YET.
      const error = this.buildError(
        ERROR_CODE.AUTH_INACTIVE,
        `Auth inactive, cannot sign in`,
        403,
        'emailSignIn',
      );
      throw new UniteHttpException(error);
    }
    // * STEP 1D. Check Auth sign in failed attempts
    const isLocked = this.isExceedAttemptLimit(auth);
    if (isLocked) {
      const error = this.buildError(
        ERROR_CODE.AUTH_SIGN_IN_FAILED_PER_HOUR_RATE_LIMIT,
        `Attempt rate limit, please try again after 1 hour`,
        406,
        'emailSignIn',
      );
      throw new UniteHttpException(error);
    }
    return true;
  }

  @MethodLogger()
  public isExceedAttemptLimit(auth: IAuth): boolean {
    // * If Failed more than SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT times within 1hour, stop it.
    const ATTEMPT_LIMIT =
      this.iamConfig.SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT || 5;
    const LOCK_ATTEMPT_EXCEED =
      this.iamConfig.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED;
    const currentTimeStamp = Date.now();
    const startingTimeStamp = LOCK_ATTEMPT_EXCEED
      ? currentTimeStamp
      : auth.lastChangedPasswordAt;
    const hourAgo = startingTimeStamp + 3600000;
    const recentFailAttempts = auth.signInFailRecordList.filter(
      (record: IAuthSignInFailedRecordItem) => {
        if (LOCK_ATTEMPT_EXCEED) {
          return record.createdAt > hourAgo;
        }
        if (auth.lastChangedPasswordAt > record.createdAt) {
          // * Ignore failed record before lastChangedPasswordAt
          return false;
        } else {
          return record.createdAt > hourAgo;
        }
      },
    );
    if (recentFailAttempts.length > ATTEMPT_LIMIT) {
      return true;
    }
    return false;
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
      contextName: 'AuthUtilService',
      methodName: `${methodName}`,
    };
    return errorObj;
  }
}
