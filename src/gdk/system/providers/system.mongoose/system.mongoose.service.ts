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
import { FlexUpdateSystemDto } from '@gdk-system/dto';
import { ApiNotModifiedResponse } from '@nestjs/swagger';

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
        await this.SystemModel.create({
          endpoints: endpoints,
        });
      } else {
        await this.SystemModel.findByIdAndUpdate(check._id, {
          $set: {
            endpoints: endpoints,
            endpointUpdatedAt: Date.now(),
          },
        });
      }
      return endpoints;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async updateById(id: string, dto: FlexUpdateSystemDto): Promise<any> {
    try {
      const updateObj: any = {};
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
