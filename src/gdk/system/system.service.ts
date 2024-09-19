import { Injectable } from '@nestjs/common';
import { FlexUpdateSystemDto } from './dto';
import { IRole, ISystem } from './types';

@Injectable()
export abstract class SystemService {
  abstract create(dto: any): Promise<any>;
  abstract findOne(): Promise<any>;
  abstract getCached(): Promise<any>;
  abstract listRoleByNamesFromCache(names: string[]): Promise<IRole[]>;
  abstract syncHttpEndpointFromSwagger(): Promise<ISystem>;
  abstract updateById(id: string, dto: FlexUpdateSystemDto): Promise<ISystem>;
  abstract deleteById(id: string): Promise<any>;
}
