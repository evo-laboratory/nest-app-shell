import { Injectable } from '@nestjs/common';
import { FlexUpdateSystemDto } from './dto';

@Injectable()
export abstract class SystemService {
  abstract create(dto: any): Promise<any>;
  abstract findOne(): Promise<any>;
  abstract syncHttpEndpointFromSwagger(): Promise<any>;
  abstract updateById(id: string, dto: FlexUpdateSystemDto): Promise<any>;
  abstract deleteById(id: string): Promise<any>;
}
