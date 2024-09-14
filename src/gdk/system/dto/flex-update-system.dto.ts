import { IFlexUpdateSystem, IRole } from '@gdk-system/types';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { RoleDto } from './role.dto';

export class FlexUpdateSystemDto implements IFlexUpdateSystem {
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  @IsOptional()
  roles: IRole[];
}
