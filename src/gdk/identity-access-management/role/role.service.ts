import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RoleService {
  abstract create(dto: any): Promise<any>;
  abstract findByName(name: string): Promise<any>;
  abstract findAll(): Promise<any>;
  abstract updateById(id: string, dto: any): Promise<any>;
  abstract deleteById(id: string): Promise<any>;
}
