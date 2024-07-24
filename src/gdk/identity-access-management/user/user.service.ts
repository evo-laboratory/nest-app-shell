import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './types/user.interface';
import { Types } from 'mongoose';
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
  abstract updateById(
    id: Types.ObjectId | string,
    dto: UpdateUserDto,
  ): Promise<IUser>;
  abstract removeById(id: string): Promise<IUser>;
}
