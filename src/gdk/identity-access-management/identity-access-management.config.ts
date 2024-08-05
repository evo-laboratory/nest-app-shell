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
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_TOKEN_EXPIRES_IN: process.env.JWT_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_TTL: parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10),
  JWT_REFRESH_TOKEN_TTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL, 10),
  JWT_PAYLOAD_PROPS_FROM_USER:
    process.env.JWT_PAYLOAD_PROPS_FROM_USER.split(','),
}));
