import { ApiProperty } from '@nestjs/swagger';
import { ResponseMetaDto } from '@shared/dto';
import { IGetResponseWrapper, IResponseMeta } from '@shared/types';
import { IUser } from '../types';
import { UserDto } from './user.dto';

export class UserListResponseDto implements IGetResponseWrapper<IUser[]> {
  @ApiProperty({ type: () => [UserDto] })
  data: IUser[];
  @ApiProperty({ type: ResponseMetaDto })
  meta?: IResponseMeta;
}
