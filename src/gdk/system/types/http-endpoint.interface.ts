import { HTTP_METHOD } from '@gdk-system/enums';

export interface IHttpEndpoint {
  method: HTTP_METHOD;
  path: string;
  permissionId: string;
  operationId: string;
}
