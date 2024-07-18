import { Injectable } from '@nestjs/common';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { IUser } from '../../user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { USER_MODEL_NAME } from '../../user.static';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { MongoDBErrorHandler } from '@shared/mongodb/mongodb-error-handler';
import { MethodLogger } from '@shared/winston-logger';

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
      return newData;
    } catch (error) {
      return Promise.reject(MongoDBErrorHandler(error));
    }
  }
  findAll(): Promise<IUser[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  findByAuthId(authId: string): Promise<IUser> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<IUser> {
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
