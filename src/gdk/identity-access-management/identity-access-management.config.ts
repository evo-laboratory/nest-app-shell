import { registerAs } from '@nestjs/config';

export default registerAs('IAM', () => ({
  CODE_EXPIRE_MIN: process.env.CODE_EXPIRE_MIN,
  SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT:
    process.env.SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT,
  LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED:
    process.env.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_TOKEN_EXPIRES_IN: process.env.JWT_TOKEN_EXPIRES_IN,
}));
