import { registerAs } from '@nestjs/config';
import { ParseAnyToBoolean } from '@shared/helper';
export const APP_CONFIG_KEY = 'APP';
export default registerAs(APP_CONFIG_KEY, () => ({
  APP_NAME: process.env.APP_NAME,
  STAGE: process.env.STAGE,
  PORT: parseInt(process.env.PORT),
  DISABLE_ERROR_META: ParseAnyToBoolean(process.env.DISABLE_ERROR_META),
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
}));
