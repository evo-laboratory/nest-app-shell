import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto, UpdateUserDto, UserRemoveRoleDto } from './dto';
import { IUser } from './types';
import { UserAddRoleDto } from './dto/user-add-role.dto';
import { GetListOptionsDto } from '@shared/dto';
import { IGetResponseWrapper } from '@shared/types';
import { IUserDataResponse } from './types/user-data-response.interface';
@Injectable()
export abstract class UserService {
  abstract create(dto: CreateUserDto, mongoSession?: any): Promise<IUser>;
  abstract listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IUser[]>>;
  abstract getById(
    id: string,
    opt: GetListOptionsDto,
    canBeNull: boolean,
  ): Promise<IUserDataResponse>;
  abstract findByAuthId(id: string): Promise<IUser>;
  abstract findByEmail(email: string): Promise<IUser>;
  abstract findOne(): Promise<IUser>;
  abstract updateEmailVerifiedById(
    id: Types.ObjectId | string,
    mongoSession?: any,
  ): Promise<IUser>;
  abstract addRole(role: UserAddRoleDto): Promise<IUser>;
  abstract updateById(
    id: Types.ObjectId | string,
    dto: UpdateUserDto,
  ): Promise<IUser>;
  abstract removeRole(role: UserRemoveRoleDto): Promise<IUser>;
  abstract deleteById(id: string, dbOpt?: any): Promise<IUser>;
}
