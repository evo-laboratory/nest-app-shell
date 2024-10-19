import { Injectable } from '@nestjs/common';
import { FlexUpdateSystemDto } from './dto';
import { IClientMap, IRole, ISystem } from './types';

@Injectable()
export abstract class SystemService {
  abstract findOne(): Promise<ISystem>;
  abstract getCached(forceFromDB: boolean): Promise<ISystem>;
  abstract setCache(dto: ISystem): Promise<ISystem>;
  abstract listRoleByNamesFromCache(names: string[]): Promise<IRole[]>;
  abstract getClientMapFromCache(): Promise<IClientMap>;
  abstract syncHttpEndpointFromSwagger(): Promise<ISystem>;
  abstract updateById(id: string, dto: FlexUpdateSystemDto): Promise<ISystem>;
}
