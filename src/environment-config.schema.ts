import * as Joi from 'joi';

export const EnvironmentConfigSchema = Joi.object({
  APP_NAME: Joi.string().default('Nest App Shell'),
  STAGE: Joi.string().valid('DEV', 'QA', 'TEST', 'PROD').default('DEV'),
  PORT: Joi.number().default(4000),
  DISABLE_ERROR_META: Joi.boolean().default(true),
  CODE_EXPIRE_MIN: Joi.number().default(5),
  SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT: Joi.number().default(5),
  LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_EXPIRES_IN: Joi.string().required(),
  MONGO_URI: Joi.string(),
  MONGO_DB_NAME: Joi.string(),
  SENDGRID_API_KEY: Joi.string(),
  SENDGRID_SENDER_EMAIL: Joi.string(),
});
