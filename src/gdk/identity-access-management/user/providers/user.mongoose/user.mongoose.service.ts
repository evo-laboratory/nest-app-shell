import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  GetOptionsMongooseQueryMapper,
  ListOptionsMongooseQueryMapper,
  MongoDBErrorHandler,
} from '@shared/mongodb';
import { MethodLogger } from '@shared/winston-logger';
import {
  CreateUserDto,
  UserFlexUpdateByIdDto,
  UserRemoveRoleDto,
} from '@gdk-iam/user/dto';
import { USER_MODEL_NAME, IUser } from '@gdk-iam/user/types';
import { IUserDataResponse } from '@gdk-iam/user/types/user-data-response.interface';
import { UserAddRoleDto } from '@gdk-iam/user/dto/user-add-role.dto';
import { IAuth } from '@gdk-iam/auth/types';
import { SystemService } from '@gdk-system/system.service';
import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import { AuthMongooseService } from '@gdk-iam/auth/providers/auth.mongoose/auth.mongoose.service';
import { GetResponseWrap, JsonStringify } from '@shared/helper';
import { IGetResponseWrapper } from '@shared/types';

import { User, UserDocument } from './user.schema';
import { UserService } from '../../user.service';

@Injectable()
export class UserMongooseService implements UserService {
  private readonly Logger = new Logger(AuthMongooseService.name);
  constructor(
    @InjectModel(USER_MODEL_NAME)
    private readonly UserModel: Model<User>,
    private readonly systemService: SystemService,
  ) {}

  @MethodLogger()
  public async create(
    dto: CreateUserDto,
    session?: ClientSession,
  ): Promise<IUser> {
    try {
      // * While create user, set default role that set in Sys.
      const defaultRoleList = [];
      const system = await this.systemService.getCached();
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
  @MethodLogger()
  public async listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IUser[]>> {
    try {
      const mappedOpts = ListOptionsMongooseQueryMapper(opt);
      this.Logger.verbose(JsonStringify(mappedOpts), 'listAll(mappedOpts)');
      const data = await this.UserModel.find(mappedOpts.filterObjs)
        .sort(mappedOpts.sortObjs)
        .populate(mappedOpts.populateFields)
        .select(mappedOpts.selectedFields)
        .skip(mappedOpts.skip)
        .limit(mappedOpts.limit)
        .lean();
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async listByEmails(
    emails: string[],
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IUser[]>> {
    try {
      const mappedOpts = ListOptionsMongooseQueryMapper(opt);
      const findQueries = {
        ...mappedOpts.filterObjs,
        email: {
          $in: emails,
        },
      };
      this.Logger.verbose(
        JsonStringify(findQueries),
        'listByEmails.findQueries',
      );
      const data = await this.UserModel.find(findQueries)
        .sort(mappedOpts.sortObjs)
        .populate(mappedOpts.populateFields)
        .select(mappedOpts.selectedFields)
        .skip(mappedOpts.skip)
        .limit(mappedOpts.limit)
        .lean();
      return GetResponseWrap(data);
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async getById(
    id: string,
    opt: GetOptionsDto,
    canBeNull = true,
  ): Promise<IUserDataResponse> {
    try {
      this.Logger.verbose(id, 'getById(id)');
      this.Logger.verbose(canBeNull, 'getById(canBeNull)');
      const mappedOpts = GetOptionsMongooseQueryMapper(opt);
      this.Logger.verbose(JsonStringify(mappedOpts), 'getById(mappedOpts)');
      const data = await this.UserModel.findById(id)
        .select(mappedOpts.selectedFields)
        .populate(mappedOpts.populateFields)
        .lean();
      if (data === null && !canBeNull) {
        // * Throw 404
        this.throwHttpError(
          ERROR_CODE.AUTH_NOT_FOUND,
          `Not found`,
          404,
          'getById',
        );
      }
      return GetResponseWrap(data);
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
    id: string,
    session?: ClientSession,
  ): Promise<IUser> {
    try {
      const updated = await this.UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            isEmailVerified: true,
            updatedAt: new Date(),
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
  public async addRole(dto: UserAddRoleDto): Promise<IUserDataResponse> {
    try {
      // * STEP 1. Check dto.roleName valid
      const roleMap = await this.systemService.listRoleByNamesFromCache([
        dto.roleName,
      ]);
      if (roleMap.length === 0) {
        this.throwHttpError(
          ERROR_CODE.ROLE_NOT_EXIST,
          `${dto.roleName} is not a valid role`,
          400,
          'addRole',
        );
      }
      // * STEP 2. Check User
      const user = await this.UserModel.findById(dto.userId);
      if (user === null) {
        this.throwHttpError(
          ERROR_CODE.USER_NOT_FOUND,
          `User not found`,
          404,
          'addRole',
        );
      }
      // * STEP 2. update User
      const updated = await this.UserModel.findByIdAndUpdate(
        dto.userId,
        {
          $addToSet: { roleList: dto.roleName },
          $set: {
            updatedAt: new Date(),
          },
        },
        { new: true },
      );
      return GetResponseWrap(updated.toJSON());
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async updateById(
    id: string,
    dto: UserFlexUpdateByIdDto,
    session?: ClientSession,
  ): Promise<IUserDataResponse> {
    try {
      // * STEP 1. Check User
      const user = await this.UserModel.findById(id);
      if (user === null) {
        this.throwHttpError(
          ERROR_CODE.USER_NOT_FOUND,
          `User not found`,
          404,
          'addRole',
        );
      }
      const updated = await this.UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...dto,
            updatedAt: new Date(),
          },
        },
        { session: session, new: true },
      );
      return GetResponseWrap(updated.toJSON());
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  @MethodLogger()
  public async removeRole(dto: UserRemoveRoleDto): Promise<IUserDataResponse> {
    try {
      // * STEP 1. Check dto.roleName valid
      const roleMap = await this.systemService.listRoleByNamesFromCache([
        dto.roleName,
      ]);
      if (roleMap.length === 0) {
        this.throwHttpError(
          ERROR_CODE.ROLE_NOT_EXIST,
          `${dto.roleName} is not a valid role`,
          400,
          'removeRole',
        );
      }
      // * STEP 2. update User
      const updated = await this.UserModel.findByIdAndUpdate(
        dto.userId,
        {
          $pull: { roleList: dto.roleName },
          $set: {
            updatedAt: new Date(),
          },
        },
        { new: true },
      );
      return GetResponseWrap(updated.toJSON());
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async deleteById(id: string, session: ClientSession): Promise<IUser> {
    try {
      const deleted = await this.UserModel.findByIdAndDelete(id, {
        session: session,
      });
      return deleted.toJSON();
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  @MethodLogger()
  public async selfDeleteById(
    id: string,
    deletedAuth: IAuth,
    session: ClientSession,
  ): Promise<IUser> {
    try {
      const user = await this.UserModel.findById(id);
      const selfDeleteUpdated = await this.UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            email: `SELF-DELETED-AT_${new Date().getTime()}_${user.email}`,
            isSelfDeleted: true,
            backupAuth: deletedAuth,
            selfDeletedAt: new Date(),
          },
        },
        { session: session, new: true },
      );
      return selfDeleteUpdated.toJSON();
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }

  private throwHttpError(
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
    throw new UniteHttpException(errorObj);
  }
}
