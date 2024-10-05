import {
  SYS_CACHE_KEY,
  SYS_CLIENT_KEY,
  SYS_ROLE_MAP_KEY,
  SYSTEM_MODEL_NAME,
} from '@gdk-system/statics';
import { SystemService } from '@gdk-system/system.service';
import { Inject, Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { MongoDBErrorHandler } from '@shared/mongodb';
import OpenAPIConvertToHttpEndpoints from '@shared/swagger/openapi-convertor';
import SwaggerDocumentBuilder from '@shared/swagger/swagger-document-builder';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { MethodLogger } from '@shared/winston-logger';
import { FlexUpdateSystemDto } from '@gdk-system/dto';
import {
  IClientMap,
  IRole,
  IRoleMap,
  ISystem,
  IUpdateSystem,
} from '@gdk-system/types';

import { AppModule } from 'src/app.module';
import { System } from './system.schema';
import appConfig from 'src/app.config';

@Injectable()
export class SystemMongooseService implements SystemService {
  constructor(
    @InjectModel(SYSTEM_MODEL_NAME)
    private readonly SystemModel: Model<System>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
  ) {}

  @MethodLogger()
  create(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  public async findOne(): Promise<ISystem> {
    try {
      const sys = await this.SystemModel.findOne({});
      return sys;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getCached(forceFromDB = false): Promise<ISystem> {
    try {
      const sys = await this.cacheManager.get<ISystem>(SYS_CACHE_KEY);
      if (!sys || forceFromDB) {
        const foundSys = await this.findOne();
        await this.setCache(foundSys);
        return foundSys;
      }
      return sys;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listRoleByNamesFromCache(names: string[]): Promise<IRole[]> {
    try {
      let roleMap = await this.cacheManager.get<IRoleMap>(SYS_ROLE_MAP_KEY);
      if (!roleMap) {
        WinstonLogger.info('No role map found in cache', {
          contextName: 'SystemMongooseService',
          methodName: 'listRoleByNamesFromCache',
        });
        const foundSys = await this.findOne();
        await this.setCache(foundSys);
        roleMap = await this.cacheManager.get<IRoleMap>(SYS_ROLE_MAP_KEY);
      }
      const roles = names.map((name) => roleMap.get(name)).filter((r) => r);
      return roles;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async getClientMapFromCache(): Promise<IClientMap> {
    try {
      let clientMap = await this.cacheManager.get<IClientMap>(SYS_CLIENT_KEY);
      if (!clientMap) {
        WinstonLogger.info('No client map found in cache', {
          contextName: 'SystemMongooseService',
          methodName: 'getClientMapFromCache',
        });
        const foundSys = await this.findOne();
        await this.setCache(foundSys);
        clientMap = await this.cacheManager.get<IClientMap>(SYS_CLIENT_KEY);
      }
      return clientMap;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @MethodLogger()
  public async syncHttpEndpointFromSwagger(): Promise<ISystem> {
    try {
      const app = await NestFactory.create(AppModule);
      const swaggerDoc = SwaggerDocumentBuilder(app);
      const endpoints = OpenAPIConvertToHttpEndpoints(swaggerDoc);
      const check = await this.SystemModel.findOne({});
      if (check === null) {
        const newSys = await this.SystemModel.create({
          endpoints: endpoints,
        });
        await this.setCache(newSys);
        return newSys;
      } else {
        const updatedSys = await this.SystemModel.findByIdAndUpdate(
          check._id,
          {
            $set: {
              endpoints: endpoints,
              endpointUpdatedAt: Date.now(),
            },
          },
          { new: true },
        );
        await this.setCache(updatedSys);
        return updatedSys;
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
      if (dto.clients && dto.clients.length > 0) {
        updateObj.clients = dto.clients;
        updateObj.clientsUpdatedAt = Date.now();
      }
      if (dto.newSignUpDefaultUserRole) {
        updateObj.newSignUpDefaultUserRole = dto.newSignUpDefaultUserRole;
      }
      if (Object.keys(updateObj).length === 0) {
        WinstonLogger.info('No update required', {
          contextName: 'SystemMongooseService',
          methodName: 'updateById',
        });
        const sys = await this.SystemModel.findById(id);
        await this.setCache(sys);
        return sys;
      }
      const updatedSys = await this.SystemModel.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true },
      );
      await this.setCache(updatedSys);
      return updatedSys;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  deleteById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  private async setCache(sys: ISystem): Promise<any> {
    try {
      await this.cacheManager.set(
        SYS_CACHE_KEY,
        sys,
        this.appEnvConfig.SYS_CACHE_TTL * 1000,
      );
      const roleMap = new Map();
      const clientMap = new Map();
      sys.roles.forEach((role) => roleMap.set(role.name, role));
      sys.clients.forEach((client) => clientMap.set(client.id, client));
      await this.cacheManager.set(
        SYS_ROLE_MAP_KEY,
        roleMap,
        this.appEnvConfig.SYS_CACHE_TTL * 1000,
      );
      await this.cacheManager.set(
        SYS_CLIENT_KEY,
        clientMap,
        this.appEnvConfig.SYS_CACHE_TTL * 1000,
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
