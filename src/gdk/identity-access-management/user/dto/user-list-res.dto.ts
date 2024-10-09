import { IGetResponseWrapper, IResponseMeta } from '@shared/types';
import { IUser } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { ResponseMetaDto } from '@shared/dto';

export class UserListResDto implements IGetResponseWrapper<IUser[]> {
  @ApiProperty({ type: () => [UserDto] })
  data: IUser[];
  @ApiProperty({ type: ResponseMetaDto })
  meta?: IResponseMeta;
}
