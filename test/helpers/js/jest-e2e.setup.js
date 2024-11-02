import mongoose from 'mongoose';
import { config } from '@dotenvx/dotenvx';
import { genSalt, hash } from 'bcrypt';
// * Same as app.module.ts
const NODE_ENV = process.env.NODE_ENV
  ? `${process.env.NODE_ENV}`.toLowerCase()
  : 'dev';
config({
  path: `.env.${NODE_ENV}`,
});

module.exports = async function (globalConfig, projectConfig) {
  console.info(`Global setup.... ${process.env.NODE_ENV}`);
  const DB_NAME = 'e2e-testing'; // * This should be same as the dbName in the test-data.static.ts
  const AUTH_MODEL_NAME = 'Auth'; // * This should be same as the AUTH_MODEL_NAME in auth.static.ts
  const USER_MODEL_NAME = 'User'; // * This should be same as the USER_MODEL_NAME in user.static.ts
  const SYS_OWNER_EMAIL = `${process.env.SYS_OWNER_EMAIL}`;
  // * Below code is same as AuthService.emailSignUp(TestOwnerData, true);
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: DB_NAME,
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
        email: SYS_OWNER_EMAIL,
        firstName: 'Sys',
        lastName: 'Owner',
        displayName: 'Sys Owner', // * Check TestSysOwnerData from test-sys-owner-data.ts
        isEmailVerified: true,
      }).save();
      const salt = await genSalt();
      const hashedPassword = await hash('sys-owner-password1234', salt); // * Check TestSysOwnerData from test-sys-owner-data.ts
      await new AuthMongoDBModel({
        googleSignInId: '',
        identifierType: 'EMAIL',
        identifier: SYS_OWNER_EMAIL,
        userId: newUser._id,
        email: SYS_OWNER_EMAIL,
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
    throw new Error('Database provider not supported');
  }
};
