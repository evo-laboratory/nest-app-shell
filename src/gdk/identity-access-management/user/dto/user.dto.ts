import { Types } from 'mongoose';
import { IUser } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { MongoObjectIdDtoRef } from '@shared/swagger';

export class UserDto implements IUser {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isEmailVerified: boolean;
  roleList: string[];
  isSelfDeleted: boolean;
  selfDeletedAt: Date;
  backupAuth: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserIdRefDto = MongoObjectIdDtoRef(UserDto);
