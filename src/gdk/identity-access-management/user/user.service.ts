import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export abstract class UserService {
  abstract create(dto: CreateUserDto): Promise<CreateUserDto>;
  abstract findAll(): Promise<CreateUserDto[]>;
  abstract findById(id: string): Promise<CreateUserDto>;
  abstract findOne(): Promise<CreateUserDto>;
  abstract updateById(id: string, dto: UpdateUserDto): Promise<CreateUserDto>;
  abstract removeById(id: string): Promise<CreateUserDto>;
}
