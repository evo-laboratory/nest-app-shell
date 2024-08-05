import * as Joi from 'joi';

// * Be aware that this schema only checks required , valid and default. Doesn't convert type.
export const EnvironmentConfigSchema = Joi.object({
  APP_NAME: Joi.string().default('Nest App Shell'),
  STAGE: Joi.string().valid('DEV', 'QA', 'TEST', 'PROD').default('DEV'),
  PORT: Joi.number().default(4000),
  DISABLE_ERROR_META: Joi.boolean().default(true),
  CODE_EXPIRE_MIN: Joi.number().default(5),
  SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT: Joi.number().default(5),
  LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED: Joi.boolean().default(false),
  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_EXPIRES_IN: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),
  JWT_PAYLOAD_PROPS_FROM_USER: Joi.string().default('_id,email'),
  MONGO_URI: Joi.string(),
  MONGO_DB_NAME: Joi.string(),
  SENDGRID_API_KEY: Joi.string(),
  SENDGRID_SENDER_EMAIL: Joi.string(),
});
