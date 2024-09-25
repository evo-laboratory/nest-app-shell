import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ICreateUser } from '../types/create-user.interface';

export class CreateUserDto implements ICreateUser {
  @IsEmail()
  email: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  displayName: string;
}
