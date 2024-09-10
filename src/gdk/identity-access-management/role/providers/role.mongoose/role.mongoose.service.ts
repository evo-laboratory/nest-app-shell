import { RoleService } from '@gdk-iam/role/role.service';
import { Injectable } from '@nestjs/common';
import { MethodLogger } from '@shared/winston-logger';

@Injectable()
export class RoleMongooseService implements RoleService {
  @MethodLogger()
  create(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  findByName(name: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  findAll(): Promise<any> {
    throw new Error('Method not implemented.');
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
