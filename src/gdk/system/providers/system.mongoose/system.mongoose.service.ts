import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import { SystemService } from '@gdk-system/system.service';
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import OpenAPIConvertToHttpEndpoints from '@shared/swagger/openapi-convertor';
import SwaggerDocumentBuilder from '@shared/swagger/swagger-document-builder';
import { MethodLogger } from '@shared/winston-logger';
import { Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { System } from './system.schema';

@Injectable()
export class SystemMongooseService implements SystemService {
  constructor(
    @InjectModel(SYSTEM_MODEL_NAME)
    private readonly SystemModel: Model<System>,
  ) {}
  @MethodLogger()
  create(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  findOne(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  public async syncHttpEndpointFromSwagger(): Promise<any> {
    try {
      const app = await NestFactory.create(AppModule);
      const swaggerDoc = SwaggerDocumentBuilder(app);
      const endpoints = OpenAPIConvertToHttpEndpoints(swaggerDoc);
      const check = await this.SystemModel.findOne({});
      if (check === null) {
        const newData = await this.SystemModel.create({
          endpoints: endpoints,
        });
        console.log(newData);
      } else {
        const updated = await this.SystemModel.findByIdAndUpdate(check._id, {
          $set: {
            endpoints: endpoints,
            endpointUpdatedAt: Date.now(),
          },
        });
        console.log(updated);
      }
      return endpoints;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  updateById(id: string, dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  deleteById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
