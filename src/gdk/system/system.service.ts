import { Injectable } from '@nestjs/common';
import { FlexUpdateSystemDto } from './dto';
import { ISystem } from './types';

@Injectable()
export abstract class SystemService {
  abstract create(dto: any): Promise<any>;
  abstract findOne(): Promise<any>;
  abstract syncHttpEndpointFromSwagger(): Promise<ISystem>;
  abstract updateById(id: string, dto: FlexUpdateSystemDto): Promise<ISystem>;
  abstract deleteById(id: string): Promise<any>;
}
