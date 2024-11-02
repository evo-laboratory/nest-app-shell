import mongoose from 'mongoose';
import {
  USER_MODEL_NAME,
  AUTH_MODEL_NAME,
  SYSTEM_MODEL_NAME,
  AUTH_ACTIVITIES_MODEL_NAME,
} from './static';
module.exports = async function () {
  console.info(
    `[jest-e2e-config.globalTeardown] ${__filename}@${process.env.NODE_ENV}`,
  );
  await ClearDatabase();
};

const flexMongoDBSchema = new mongoose.Schema({}, { strict: false });

async function ClearDatabase() {
  if (process.env.DATABASE_PROVIDER === 'MONGODB') {
    try {
      const UserMongoDBModel =
        mongoose.models[USER_MODEL_NAME] ||
        mongoose.model(USER_MODEL_NAME, flexMongoDBSchema);
      const AuthMongoDBModel =
        mongoose.models[AUTH_MODEL_NAME] ||
        mongoose.model(AUTH_MODEL_NAME, flexMongoDBSchema);
      const SystemMongoDBModel =
        mongoose.models[SYSTEM_MODEL_NAME] ||
        mongoose.model(SYSTEM_MODEL_NAME, flexMongoDBSchema);
      const AuthActivitiesMongoDBModel =
        mongoose.models[AUTH_ACTIVITIES_MODEL_NAME] ||
        mongoose.model(AUTH_ACTIVITIES_MODEL_NAME, flexMongoDBSchema);
      await UserMongoDBModel.deleteMany({});
      await AuthMongoDBModel.deleteMany({});
      await SystemMongoDBModel.deleteMany({});
      await AuthActivitiesMongoDBModel.deleteMany({});
      await mongoose.disconnect();
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } else {
    throw new Error(
      `[jest-e2e-config.globalTeardown] ${__filename}@${process.env.NODE_ENV} ClearDatabase failed, ${process.env.DATABASE_PROVIDER} is not supported`,
    );
  }
}
