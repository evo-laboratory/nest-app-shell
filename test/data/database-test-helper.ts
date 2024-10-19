import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import mongoose, { Connection } from 'mongoose';
import { DefaultSystemData } from './test-data-json';

class DatabaseTestHelper {
  private connection: Connection;
  private flexMongoDBSchema = new mongoose.Schema({}, { strict: false });
  private SystemMongoDBModel = mongoose.model(
    `${SYSTEM_MODEL_NAME}`,
    this.flexMongoDBSchema,
  );

  constructor(
    private provider: 'mongodb' | 'mysql',
    private mongodbUri: string,
    private mongodbName: string,
  ) {}

  public static async initMongoDB(uri: string, dbName: string) {
    await mongoose.connect(uri, { dbName });
    return new DatabaseTestHelper('mongodb', uri, dbName);
  }

  public async setupSystem() {
    if (this.provider === 'mongodb') {
      await this.SystemMongoDBModel.create(DefaultSystemData());
    } else {
      throw new Error('Not implemented');
    }
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async clearDatabase() {
    if (this.provider === 'mongodb') {
      await this.SystemMongoDBModel.deleteMany({});
    } else {
      throw new Error('Not implemented');
    }
  }
}

export { DatabaseTestHelper };
