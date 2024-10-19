import { Injectable } from '@nestjs/common';
import { FlexUpdateSystemDto } from './dto';
import { IClientMap, IRole, ISystem } from './types';

@Injectable()
export abstract class SystemService {
  abstract create(dto: any): Promise<any>;
  abstract findOne(): Promise<any>;
  abstract getCached(): Promise<ISystem>;
  abstract setCache(dto: ISystem): Promise<ISystem>;
  abstract listRoleByNamesFromCache(names: string[]): Promise<IRole[]>;
  abstract getClientMapFromCache(): Promise<IClientMap>;
  abstract syncHttpEndpointFromSwagger(): Promise<ISystem>;
  abstract updateById(id: string, dto: FlexUpdateSystemDto): Promise<ISystem>;
  abstract deleteById(id: string): Promise<any>;
}
