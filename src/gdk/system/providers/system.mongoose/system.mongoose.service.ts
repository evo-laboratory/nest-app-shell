import { SYSTEM_MODEL_NAME } from '@gdk-system/statics';
import { SystemService } from '@gdk-system/system.service';
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import OpenAPIConvertToHttpEndpoints from '@shared/swagger/openapi-convertor';
import SwaggerDocumentBuilder from '@shared/swagger/swagger-document-builder';
import { MethodLogger } from '@shared/winston-logger';
import { FlexUpdateSystemDto } from '@gdk-system/dto';
import { ISystem, IUpdateSystem } from '@gdk-system/types';

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
  public async syncHttpEndpointFromSwagger(): Promise<ISystem> {
    try {
      const app = await NestFactory.create(AppModule);
      const swaggerDoc = SwaggerDocumentBuilder(app);
      const endpoints = OpenAPIConvertToHttpEndpoints(swaggerDoc);
      const check = await this.SystemModel.findOne({});
      if (check === null) {
        return await this.SystemModel.create({
          endpoints: endpoints,
        });
      } else {
        return await this.SystemModel.findByIdAndUpdate(check._id, {
          $set: {
            endpoints: endpoints,
            endpointUpdatedAt: Date.now(),
          },
        });
      }
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async updateById(
    id: string,
    dto: FlexUpdateSystemDto,
  ): Promise<ISystem> {
    try {
      const updateObj: IUpdateSystem = {};
      if (dto.roles && dto.roles.length > 0) {
        updateObj.roles = dto.roles;
        updateObj.rolesUpdatedAt = Date.now();
      }
      if (Object.keys(updateObj).length === 0) {
        return await this.SystemModel.findById(id);
      }
      return await this.SystemModel.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true },
      );
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  deleteById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
