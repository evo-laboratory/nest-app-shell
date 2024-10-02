import { PAGINATION_METHOD } from '@shared/enums';
import {
  IGetQueryFilter,
  IGetQueryOptions,
  IGetQuerySortFields,
} from '@shared/types';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

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
  sortFields?: IGetQuerySortFields;
  @IsOptional()
  filters?: IGetQueryFilter;
  @IsOptional()
  @IsString()
  fieldSelection?: string;
  @IsOptional()
  @IsString()
  relationFields?: string;
}
