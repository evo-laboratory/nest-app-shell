import { Injectable } from '@nestjs/common';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { IUser } from '../../user.interface';

@Injectable()
export class UserMongooseService implements UserService {
  create(dto: CreateUserDto): Promise<IUser> {
    throw new Error('Method not implemented.');
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
