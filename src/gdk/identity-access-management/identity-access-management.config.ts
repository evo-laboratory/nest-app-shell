import { registerAs } from '@nestjs/config';
import { ParseAnyToBoolean } from '@shared/helper';

export const IAM_CONFIG_KEY = 'IAM';

export default registerAs(IAM_CONFIG_KEY, () => ({
  CODE_EXPIRE_MIN: parseInt(process.env.CODE_EXPIRE_MIN, 10),
  SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT: parseInt(
    process.env.SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT,
    10,
  ),
  LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED: ParseAnyToBoolean(
    process.env.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED,
  ),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_TOKEN_EXPIRES_IN: process.env.JWT_TOKEN_EXPIRES_IN,
}));
