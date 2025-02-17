import { registerAs } from '@nestjs/config';
import { ParseAnyToBoolean } from '@shared/helper';
export const APP_CONFIG_KEY = 'APP';
export default registerAs(APP_CONFIG_KEY, () => ({
  APP_NAME: process.env.APP_NAME,
  STAGE: process.env.STAGE,
  PORT: parseInt(process.env.PORT),
  DISABLE_ERROR_META: ParseAnyToBoolean(process.env.DISABLE_ERROR_META),
  ENABLE_SWAGGER: ParseAnyToBoolean(process.env.ENABLE_SWAGGER),
  SYS_CACHE_TTL: parseInt(process.env.SYS_CACHE_TTL),
  SYS_OWNER_EMAIL: process.env.SYS_OWNER_EMAIL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  CLIENT_KEY_NAME: process.env.CLIENT_KEY_NAME,
  DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
}));
