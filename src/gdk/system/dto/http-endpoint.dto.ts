import { HTTP_METHOD } from '@gdk-system/enums';
import { IHttpEndpoint } from '@gdk-system/types';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class HttpEndpointDto implements IHttpEndpoint {
  @IsEnum(HTTP_METHOD)
  method: HTTP_METHOD;
  @IsString()
  path: string;
  @IsString()
  permissionId: string;
  @IsString()
  operationId: string;
  @IsOptional()
  meta: any;
}
