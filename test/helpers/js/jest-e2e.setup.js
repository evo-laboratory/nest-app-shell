import mongoose from 'mongoose';
import { config } from '@dotenvx/dotenvx';
import { genSalt, hash } from 'bcrypt';
import {
  E2E_TEST_DB_NAME,
  AUTH_MODEL_NAME,
  USER_MODEL_NAME,
  SYS_OWNER_PASSWORD,
} from './static';
// * Same as app.module.ts
const NODE_ENV = process.env.NODE_ENV
  ? `${process.env.NODE_ENV}`.toLowerCase()
  : 'dev';
config({
  path: `.env.${NODE_ENV}`,
});

module.exports = async function (globalConfig, projectConfig) {
  console.info(`Global setup.... ${process.env.NODE_ENV}`);
  const SYS_OWNER_EMAIL = `${process.env.SYS_OWNER_EMAIL}`;
  await SimulateAuthEmailSignUp(SYS_OWNER_EMAIL);
};

async function SimulateAuthEmailSignUp(email) {
  // * Below code should same as AuthService.emailSignUp(TestOwnerData, true);
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: E2E_TEST_DB_NAME,
      });
      const flexMongoDBSchema = new mongoose.Schema({}, { strict: false });
      const UserMongoDBModel = mongoose.model(
        USER_MODEL_NAME,
        flexMongoDBSchema,
      );
      const AuthMongoDBModel = mongoose.model(
        AUTH_MODEL_NAME,
        flexMongoDBSchema,
      );
      const newUser = await new UserMongoDBModel({
        email: email,
        firstName: 'Sys',
        lastName: 'Owner',
        displayName: 'Sys Owner', // * Check TestSysOwnerData from test-sys-owner-data.ts
        isEmailVerified: true,
      }).save();
      const salt = await genSalt();
      const hashedPassword = await hash(SYS_OWNER_PASSWORD, salt);
      await new AuthMongoDBModel({
        googleSignInId: '',
        identifierType: 'EMAIL',
        identifier: email,
        userId: newUser._id,
        password: hashedPassword,
        code: '',
        codeExpiredAt: 0,
        codeUsage: 'NOT_SET',
        isIdentifierVerified: true,
        isActivated: true,
        inactivatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastChangedPasswordAt: null,
      }).save();
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error(
      `[jest-e2e-setup.js] SimulateAuthEmailSignUp failed, ${process.env.DATABASE_PROVIDER} is not supported`,
    );
  }
}
