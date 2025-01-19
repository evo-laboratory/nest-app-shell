import { Injectable } from '@nestjs/common';
import { IAuth } from '@gdk-iam/auth/types';
import { GetListOptionsDto } from '@shared/dto';
import { IGetResponseWrapper } from '@shared/types';
import { CreateUserDto, UserFlexUpdateByIdDto, UserRemoveRoleDto } from './dto';
import { IUser } from './types';
import { UserAddRoleDto } from './dto/user-add-role.dto';
import { IUserDataResponse } from './types/user-data-response.interface';

@Injectable()
export abstract class UserService {
  abstract create(dto: CreateUserDto, mongoSession?: any): Promise<IUser>;
  abstract listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IUser[]>>;
  abstract listByEmails(
    emails: string[],
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
    id: string,
    mongoSession?: any,
  ): Promise<IUser>;
  abstract addRole(role: UserAddRoleDto): Promise<IUserDataResponse>;
  abstract updateById(
    id: string,
    dto: UserFlexUpdateByIdDto,
  ): Promise<IUserDataResponse>;
  abstract removeRole(role: UserRemoveRoleDto): Promise<IUserDataResponse>;
  abstract deleteById(id: string, dbOpt?: any): Promise<IUser>;
  abstract selfDeleteById(
    id: string,
    deletedAuth: IAuth,
    dbOpt?: any,
  ): Promise<IUser>;
}
