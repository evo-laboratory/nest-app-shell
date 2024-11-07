import { IGetOptions } from '@shared/types';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GetOptionsDto implements IGetOptions {
  @IsOptional()
  @IsString()
  @Matches(/^(-?\w+,?)*$/, { message: 'Invalid field selection format' })
  fieldSelection?: string; // Regex test -field1,-field2 or field1,field2

  @IsOptional()
  @IsString()
  @Matches(/^(\w+,?)*$/, { message: 'Invalid relation fields format' })
  relationFields?: string; // Regex test name or name,age,email
}
