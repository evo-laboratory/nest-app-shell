import mongoose from 'mongoose';
import { config } from '@dotenvx/dotenvx';
import { genSalt, hash } from 'bcrypt';
import {
  E2E_TEST_DB_NAME,
  AUTH_MODEL_NAME,
  USER_MODEL_NAME,
  SYSTEM_MODEL_NAME,
  SYS_OWNER_PASSWORD,
  TEST_SUPER_ROLE,
  TEST_GENERAL_ROLE,
  TEST_CLIENT_ID,
  TEST_GENERAL_TWO_ROLE,
} from './static';
// * Same as app.module.ts
const NODE_ENV = process.env.NODE_ENV
  ? `${process.env.NODE_ENV}`.toLowerCase()
  : 'dev';
config({
  path: `.env.${NODE_ENV}`,
});

module.exports = async function () {
  console.info(
    `[jest-e2e-config.globalSetup] ${__filename}@${process.env.NODE_ENV}`,
  );
  const SYS_OWNER_EMAIL = `${process.env.SYS_OWNER_EMAIL}`;
  await SimulateAuthEmailSignUp(SYS_OWNER_EMAIL);
  await SetupSystem();
};

const flexMongoDBSchema = new mongoose.Schema({}, { strict: false });

async function SimulateAuthEmailSignUp(email) {
  // * Below code should same as AuthService.emailSignUp(TestOwnerData, true);
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: E2E_TEST_DB_NAME,
      });
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
        roleList: [TEST_SUPER_ROLE],
        createdAt: new Date(),
        updatedAt: new Date(),
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
      `[jest-e2e-config.globalSetup] ${__filename}@${process.env.NODE_ENV} SimulateAuthEmailSignUp failed,\n${process.env.DATABASE_PROVIDER} is not supported`,
    );
  }
}

async function SetupSystem() {
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      const SystemMongoDBModel = mongoose.model(
        `${SYSTEM_MODEL_NAME}`,
        flexMongoDBSchema,
      );
      await new SystemMongoDBModel({
        roles: [
          {
            name: TEST_SUPER_ROLE,
            setMethod: 'BLACK_LIST', // * This should be 'WHITE_LIST' or 'BLACK_LIST' in role-set-method.enum.ts
            endpointPermissions: [],
            description: 'Super Admin Role',
          },
          {
            name: TEST_GENERAL_ROLE,
            setMethod: 'WHITE_LIST', // * This should be 'WHITE_LIST' or 'BLACK_LIST' in role-set-method.enum.ts
            endpointPermissions: [],
            description: 'General User Role',
          },
          {
            name: TEST_SUPER_ROLE,
            setMethod: 'BLACK_LIST', // * This should be 'WHITE_LIST' or 'BLACK_LIST' in role-set-method.enum.ts
            endpointPermissions: [],
            description: 'Super Admin Role',
          },
          {
            name: TEST_GENERAL_TWO_ROLE,
            setMethod: 'WHITE_LIST', // * This should be 'WHITE_LIST' or 'BLACK_LIST' in role-set-method.enum.ts
            endpointPermissions: [],
            description: 'General User Role',
          },
        ],
        rolesUpdatedAt: new Date(),
        endpoints: [],
        endpointUpdatedAt: new Date(),
        clients: [
          {
            id: TEST_CLIENT_ID,
            name: 'test-runner',
            willExpire: false,
            expiredAt: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        newSignUpDefaultUserRole: TEST_GENERAL_ROLE,
        clientUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).save();
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } else {
    throw new Error(
      `[jest-e2e-config.globalSetup] ${__filename}@${process.env.NODE_ENV} SetupSystem failed, \n${process.env.DATABASE_PROVIDER} is not supported`,
    );
  }
}
