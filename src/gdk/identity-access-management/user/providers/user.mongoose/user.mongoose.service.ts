import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { MongoDBErrorHandler } from '@shared/mongodb';
import { MethodLogger } from '@shared/winston-logger';
import {
  CreateUserDto,
  UpdateUserDto,
  UserRemoveRoleDto,
} from '@gdk-iam/user/dto';
import { USER_MODEL_NAME, IUser } from '@gdk-iam/user/types';

import { UserAddRoleDto } from '@gdk-iam/user/dto/user-add-role.dto';
import { SystemService } from '@gdk-system/system.service';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';

import { User, UserDocument } from './user.schema';
import { UserService } from '../../user.service';

@Injectable()
export class UserMongooseService implements UserService {
  constructor(
    @InjectModel(USER_MODEL_NAME)
    private readonly UserModel: Model<User>,
    private readonly sys: SystemService,
  ) {}

  @MethodLogger()
  public async create(
    dto: CreateUserDto,
    session?: ClientSession,
  ): Promise<IUser> {
    try {
      // * While create user, set default role that set in Sys.
      const defaultRoleList = [];
      const system = await this.sys.getCached();
      const defaultRole = system.newSignUpDefaultUserRole;
      const roleCheck = system.roles.filter((r) => r.name === defaultRole);
      if (system.newSignUpDefaultUserRole && roleCheck.length > 0) {
        defaultRoleList.push(system.newSignUpDefaultUserRole);
      }
      const newData: UserDocument = await new this.UserModel({
        ...dto,
        roleList: defaultRoleList,
      }).save({ session: session });
      return newData.toJSON();
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  findAll(): Promise<IUser[]> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  public async findById(id: string): Promise<IUser> {
    try {
      const user = await this.UserModel.findById(id);
      return user;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  findByAuthId(authId: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  public async findByEmail(email: string): Promise<IUser> {
    try {
      const user = await this.UserModel.findOne({
        email: email,
      });
      if (user !== null) {
        return user.toJSON();
      }
      return null;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  findOne(): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  public async updateEmailVerifiedById(
    id: Types.ObjectId,
    session?: ClientSession,
  ): Promise<IUser> {
    try {
      const updated = await this.UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            isEmailVerified: true,
            updatedAt: Date.now(),
          },
        },
        { session: session },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async addRole(dto: UserAddRoleDto): Promise<IUser> {
    try {
      // * STEP 1. Check dto.roleName valid
      const roleMap = await this.sys.listRoleByNamesFromCache([dto.roleName]);
      if (roleMap.length === 0) {
        const error = this.buildError(
          ERROR_CODE.ROLE_NOT_EXIST,
          `${dto.roleName} is not a valid role`,
          400,
          'addRole',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. update User
      const updated = await this.UserModel.findByIdAndUpdate(
        dto.userId,
        {
          $addToSet: { roleList: dto.roleName },
          $set: {
            updatedAt: Date.now(),
          },
        },
        { new: true },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  updateById(id: string, dto: UpdateUserDto): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  @MethodLogger()
  public async removeRole(dto: UserRemoveRoleDto): Promise<IUser> {
    try {
      // * STEP 1. Check dto.roleName valid
      const roleMap = await this.sys.listRoleByNamesFromCache([dto.roleName]);
      if (roleMap.length === 0) {
        const error = this.buildError(
          ERROR_CODE.ROLE_NOT_EXIST,
          `${dto.roleName} is not a valid role`,
          400,
          'removeRole',
        );
        throw new UniteHttpException(error);
      }
      // * STEP 2. update User
      const updated = await this.UserModel.findByIdAndUpdate(
        dto.userId,
        {
          $pull: { roleList: dto.roleName },
          $set: {
            updatedAt: Date.now(),
          },
        },
        { new: true },
      );
      return updated;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  removeById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }

  @MethodLogger()
  private buildError(
    code: ERROR_CODE,
    msg: string,
    statusCode?: number,
    methodName?: string,
  ): IUnitedHttpException {
    const errorObj: IUnitedHttpException = {
      source: ERROR_SOURCE.NESTJS,
      errorCode: code || ERROR_CODE.UNKNOWN,
      message: msg,
      statusCode: statusCode || 500,
      contextName: 'UserMongooseService',
      methodName: `${methodName}`,
    };
    return errorObj;
  }
}
