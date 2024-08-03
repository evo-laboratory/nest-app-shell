import { registerAs } from '@nestjs/config';
export const MAIL_CONFIG_KEY = 'MAIL';

export default registerAs(MAIL_CONFIG_KEY, () => ({
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_SENDER_EMAIL: process.env.SENDGRID_SENDER_EMAIL,
}));
