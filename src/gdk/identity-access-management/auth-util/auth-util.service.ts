import {
  IAuth,
  IAuthGeneratedCode,
  IAuthSignInFailedRecordItem,
} from '@gdk-iam/auth/types';
import { Injectable } from '@nestjs/common';
import {
  MinToMilliseconds,
  ParseAnyToBoolean,
  RandomNumber,
} from '@shared/helper';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class AuthUtilService {
  @MethodLogger()
  public generateAuthCode(): IAuthGeneratedCode {
    const code = RandomNumber();
    const EXPIRE_MIN = process.env.CODE_EXPIRE_MIN || 3;
    const expiredAt = Date.now() + MinToMilliseconds(EXPIRE_MIN);
    return {
      code: code,
      codeExpiredAt: expiredAt,
    };
  }

  @MethodLogger()
  public isExceedAttemptLimit(auth: IAuth): boolean {
    // * If Failed more than SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT times within 1hour, stop it.
    const ATTEMPT_LIMIT =
      Number(process.env.SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT) || 5;
    const LOCK_ATTEMPT_EXCEED = ParseAnyToBoolean(
      process.env.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED,
    );
    const currentTimeStamp = Date.now();
    const startingTimeStamp = LOCK_ATTEMPT_EXCEED
      ? currentTimeStamp
      : auth.lastChangedPasswordAt;
    const hourAgo = startingTimeStamp - 3600000;
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
}
