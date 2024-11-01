import mongoose from 'mongoose';

module.exports = async function (globalConfig, projectConfig) {
  console.info('Global setup....');
  const DB_NAME = 'e2e-testing'; // * This should be same as the dbName in the test-data.static.ts
  const AUTH_MODEL_NAME = 'Auth'; // * This should be same as the AUTH_MODEL_NAME in auth.static.ts
  const USER_MODEL_NAME = 'User'; // * This should be same as the USER_MODEL_NAME in user.static.ts
  const SYS_OWNER_EMAIL = `${process.env.SYS_OWNER_EMAIL}`;
  // * Below code is same as AuthService.emailSignUp(TestOwnerData, true);
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
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
      await new AuthMongoDBModel({
        googleSignInId: '',
        identifierType: 'EMAIL',
        identifier: SYS_OWNER_EMAIL,
        userId: newUser._id,
        email: SYS_OWNER_EMAIL,
        password: 'sys-owner-password1234', // * Check TestSysOwnerData from test-sys-owner-data.ts
        code: '',
        codeExpiredAt: 0,
        codeUsage: 'NOT_SET',
        isEmailVerified: true,
      }).save();
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error('Database provider not supported');
  }
};
