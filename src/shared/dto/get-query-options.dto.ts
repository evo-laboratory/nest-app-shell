import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PAGINATION_METHOD } from '@shared/enums';
import {
  IGetQueryFilter,
  IGetQueryOptions,
  IGetQuerySortFields,
} from '@shared/types';
import { Transform, Type } from 'class-transformer';
import { IsValidSortFields } from '@shared/validator-constraints';

export class GetQueryOptionsDto implements IGetQueryOptions {
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
  sortFields?: IGetQuerySortFields;
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  filters?: IGetQueryFilter;
  @IsOptional()
  @IsString()
  fieldSelection?: string;
  @IsOptional()
  @IsString()
  relationFields?: string;
}
