import { PAGINATION_METHOD } from '@shared/enums';
import {
  IGetQueryFilter,
  IGetQueryOptions,
  IGetQuerySortFields,
} from '@shared/types';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { GetQuerySortFieldsDto } from './get-query-sort-fields.dto';

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
  @Type((test) => {
    const json = JSON.parse(test.object[test.property]);
    const sortFields = new GetQuerySortFieldsDto(json);
    return () => sortFields;
  })
  @IsObject()
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
