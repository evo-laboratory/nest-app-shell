import { HTTP_METHOD } from '@gdk-system/enums';
import { IHttpEndpoint } from '@gdk-system/types';
import { OpenAPIObject } from '@nestjs/swagger';
import { PathToPermissionIdPath } from '@shared/helper';

function OpenAPIConvertToHttpEndpoints(openAPIObj: OpenAPIObject) {
  const results = [];
  // * Mapping all the paths found
  Object.keys(openAPIObj.paths).forEach((pathName: string) => {
    const pathPermissionId = PathToPermissionIdPath(pathName);
    if (pathPermissionId) {
      // * Mapping all the methods under paths found
      Object.keys(openAPIObj.paths[pathName]).forEach((methodName) => {
        const method = methodName.toUpperCase() as HTTP_METHOD;
        const ep: IHttpEndpoint = {
          method: method,
          path: pathName,
          permissionId: `${method}:${pathPermissionId}`,
          operationId: openAPIObj.paths[pathName][methodName].operationId,
          meta: {}, // TODO Provide body dto and res dto
        };
        results.push(ep);
      });
    }
  });
  return results;
}

export default OpenAPIConvertToHttpEndpoints;
