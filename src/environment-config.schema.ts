import * as Joi from 'joi';

// * Be aware that this schema only checks required , valid and default. Doesn't convert type.
export const EnvironmentConfigSchema = Joi.object({
  APP_NAME: Joi.string().default('Nest App Shell'),
  STAGE: Joi.string().valid('DEV', 'QA', 'TEST', 'PROD').default('DEV'),
  PORT: Joi.number().default(4000),
  DISABLE_ERROR_META: Joi.boolean().default(true),
  ENABLE_SWAGGER: Joi.boolean().default(false),
  SYS_CACHE_TTL: Joi.number().default(3600),
  SYS_OWNER_EMAIL: Joi.string().email().default(''),
  MONGO_URI: Joi.string(),
  MONGO_DB_NAME: Joi.string(),
  CODE_EXPIRE_MIN: Joi.number().default(5),
  SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT: Joi.number().default(5),
  LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED: Joi.boolean().default(false),
  CHECK_REVOKED_TOKEN: Joi.boolean().default(false),
  REVOKED_TOKEN_PROVIDER: Joi.string()
    .valid('DATABASE', 'REDIS')
    .default('DATABASE'),
  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_EXPIRES_IN: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),
  JWT_PAYLOAD_PROPS_FROM_USER: Joi.string().default('_id,email'),
  SENDGRID_API_KEY: Joi.string(),
  SENDGRID_SENDER_EMAIL: Joi.string(),
});
