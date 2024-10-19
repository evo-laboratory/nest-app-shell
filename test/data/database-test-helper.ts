import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import mongoose from 'mongoose';
import { DefaultSystemData } from './test-data-json';

class DatabaseTestHelper {
  private flexMongoDBSchema = new mongoose.Schema({}, { strict: false });
  private SystemMongoDBModel = mongoose.model(
    `${SYSTEM_MODEL_NAME}`,
    this.flexMongoDBSchema,
  );

  constructor(
    private provider: 'MONGODB' | 'MY_SQL',
    private mongodbUri?: string,
    private mongodbName?: string,
  ) {}

  public static async init(
    provider: 'MONGODB' | 'MY_SQL',
    mongodbUri: string,
    mongodbName: string,
  ) {
    if (provider === 'MONGODB') {
      await mongoose.connect(mongodbUri, { dbName: mongodbName });
      return new DatabaseTestHelper(provider, mongodbUri, mongodbName);
    } else {
      throw new Error('Not implemented');
    }
  }

  public async setupSystem() {
    if (this.provider === 'MONGODB') {
      await this.SystemMongoDBModel.create(DefaultSystemData());
    } else {
      throw new Error('Not implemented');
    }
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async clearDatabase() {
    if (this.provider === 'MONGODB') {
      await this.SystemMongoDBModel.deleteMany({});
    } else {
      throw new Error('Not implemented');
    }
  }
}

export { DatabaseTestHelper };
