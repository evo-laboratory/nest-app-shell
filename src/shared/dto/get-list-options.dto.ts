import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PAGINATION_METHOD } from '@shared/enums';
import {
  IGetListFilters,
  IGetListOptions,
  IGetListSortFields,
} from '@shared/types';
import {
  IsValidGetListFilters,
  IsValidSortFields,
} from '@shared/validator-constraints';

export class GetListOptionsDto implements IGetListOptions {
  @IsOptional()
  @IsEnum(PAGINATION_METHOD)
  paginationMethod?: PAGINATION_METHOD;
  @IsOptional()
  @IsString()
  pageCursorToken?: string;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageOffset?: number;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageLimit?: number;
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsValidSortFields()
  sortFields?: IGetListSortFields;
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsValidGetListFilters()
  filters?: IGetListFilters;
  @IsOptional()
  @IsString()
  fieldSelection?: string; // TODO Regex test -field1,-field2 or field,field2
  @IsOptional()
  @IsString()
  relationFields?: string; // TODO Regex test name | name,age,email
}
