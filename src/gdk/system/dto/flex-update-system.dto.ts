import { IClient, IFlexUpdateSystem, IRole } from '@gdk-system/types';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { RoleDto } from './role.dto';
import { ClientDto } from './client.dto';

export class FlexUpdateSystemDto implements IFlexUpdateSystem {
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  @IsOptional()
  roles: IRole[];
  @ValidateNested({ each: true })
  @Type(() => ClientDto)
  @IsOptional()
  clients: IClient[];
  @IsString()
  @IsOptional()
  newSignUpDefaultUserRole: string;
}
