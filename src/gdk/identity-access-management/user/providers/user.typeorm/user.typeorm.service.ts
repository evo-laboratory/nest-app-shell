import { Injectable } from '@nestjs/common';
import { IUser } from '@gdk-iam/user/types/user.interface';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { Types } from 'mongoose';
@Injectable()
export class UserTypeOrmService implements UserService {
  addRole(role: any): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  removeRole(role: any): Promise<IUser> {
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
  findAll(): Promise<IUser[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<IUser> {
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
  updateById(id: string, dto: UpdateUserDto): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  removeById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
}
