import { IGetOptions } from '@shared/types';
import { IsOptional, IsString } from 'class-validator';

export class GetOptionsDto implements IGetOptions {
  @IsOptional()
  @IsString()
  fieldSelection?: string; // TODO Regex test -field1,-field2 or field,field2
  @IsOptional()
  @IsString()
  relationFields?: string; // TODO Regex test name | name,age,email
}
