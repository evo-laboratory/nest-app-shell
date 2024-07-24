import { Injectable } from '@nestjs/common';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { USER_MODEL_NAME } from '../../types/user.static';
import { ClientSession, Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import { MethodLogger } from '@shared/winston-logger';
import { IUser } from '@gdk-iam/user/types/user.interface';

@Injectable()
export class UserMongooseService implements UserService {
  constructor(
    @InjectModel(USER_MODEL_NAME)
    private readonly UserModel: Model<User>,
  ) {}

  @MethodLogger()
  public async create(
    dto: CreateUserDto,
    session?: ClientSession,
  ): Promise<IUser> {
    try {
      const newData: UserDocument = await new this.UserModel({
        ...dto,
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
  updateById(id: string, dto: UpdateUserDto): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  removeById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
}
