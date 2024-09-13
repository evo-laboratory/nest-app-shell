import { SystemService } from '@gdk-system/system.service';
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import OpenAPIConvertToHttpEndpoints from '@shared/swagger/openapi-convertor';
import SwaggerDocumentBuilder from '@shared/swagger/swagger-document-builder';
import { MethodLogger } from '@shared/winston-logger';
import { AppModule } from 'src/app.module';

@Injectable()
export class SystemMongooseService implements SystemService {
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
      return endpoints;
    } catch (error) {
      return Promise.reject(error);
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
