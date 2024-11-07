import { Injectable } from '@nestjs/common';
import { IUser } from '@gdk-iam/user/types/user.interface';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { Types } from 'mongoose';
import { IUserDataResponse } from '@gdk-iam/user/types/user-data-response.interface';
import { UserFlexUpdateByIdDto } from '@gdk-iam/user/dto';
@Injectable()
export class UserTypeOrmService implements UserService {
  selfDeleteById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  deleteById(id: string, dbOpt?: any): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  addRole(role: any): Promise<IUserDataResponse> {
    throw new Error('Method not implemented.');
  }
  removeRole(role: any): Promise<IUserDataResponse> {
    throw new Error('Method not implemented.');
  }
  updateEmailVerifiedById(
    id: Types.ObjectId | string,
    mongoSession?: any,
  ): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  create(dto: CreateUserDto): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  listAll(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getById(id: string, any, canBeNull = true): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findByAuthId(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  findByEmail(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  findOne(): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  updateById(
    id: string,
    dto: UserFlexUpdateByIdDto,
  ): Promise<IUserDataResponse> {
    throw new Error('Method not implemented.');
  }
  removeById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
}
