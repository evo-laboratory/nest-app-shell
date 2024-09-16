import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IUser } from './types';
import { UserAddRoleDto } from './dto/user-add-role.dto';
@Injectable()
export abstract class UserService {
  abstract create(dto: CreateUserDto, mongoSession?: any): Promise<IUser>;
  abstract findAll(): Promise<IUser[]>;
  abstract findById(id: string): Promise<IUser>;
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
  abstract removeById(id: string): Promise<IUser>;
}
