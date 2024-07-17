import { Injectable } from '@nestjs/common';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

@Injectable()
export class UserMongooseService implements UserService {
  create(dto: CreateUserDto): Promise<CreateUserDto> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<CreateUserDto[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<CreateUserDto> {
    throw new Error('Method not implemented.');
  }
  findOne(): Promise<CreateUserDto> {
    throw new Error('Method not implemented.');
  }
  updateById(id: string, dto: UpdateUserDto): Promise<CreateUserDto> {
    throw new Error('Method not implemented.');
  }
  removeById(id: string): Promise<CreateUserDto> {
    throw new Error('Method not implemented.');
  }
}
