import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../types';
import { UserDto } from './user.dto';
import { IUserDataResponse } from '../types/user-data-response.interface';

export class UserDataResponseDto implements IUserDataResponse {
  @ApiProperty({ type: () => UserDto })
  data: IUser;
}
