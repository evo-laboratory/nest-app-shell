import { ApiProperty } from '@nestjs/swagger';
import { IUser, IUserDataResponse } from '../types';
import { UserDto } from './user.dto';
export class UserDataResponseDto implements IUserDataResponse {
  @ApiProperty({ type: () => UserDto })
  data: IUser;
}
