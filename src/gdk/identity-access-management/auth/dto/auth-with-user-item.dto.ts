import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { AUTH_METHOD } from '../enums';
import { AUTH_IDENTIFIER_TYPE, IAuthWithUserItem } from '../types';

export class AuthWithUserItemDto implements IAuthWithUserItem {
  @IsString()
  identifier: string;
  @IsEnum(AUTH_IDENTIFIER_TYPE)
  identifierType: AUTH_IDENTIFIER_TYPE;
  @IsEnum(AUTH_IDENTIFIER_TYPE, { each: true })
  signUpMethodList: AUTH_METHOD[];
  @IsString()
  @MinLength(6)
  password: string;
  @IsBoolean()
  isIdentifierVerified: boolean;
  @IsEmail()
  email: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  displayName: string;
  @IsBoolean()
  isEmailVerified: boolean;
  @IsArray()
  @IsString({ each: true })
  roleList: string[];
}
