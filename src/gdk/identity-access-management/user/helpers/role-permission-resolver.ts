import { ROLE_SET_METHOD } from '@gdk-system/enums';
import { IRole } from '@gdk-system/types';

function RolePermissionResolver(roles: IRole[], permissionId: string): boolean {
  let allow = false;
  for (let index = 0; index < roles.length; index++) {
    const thisRole = roles[index];
    if (
      thisRole.setMethod === ROLE_SET_METHOD.BLACK_LIST &&
      thisRole.endpointPermissions.length === 0
    ) {
      // * Already consider as SuperUser
      return true;
    }
    if (
      thisRole.setMethod === ROLE_SET_METHOD.BLACK_LIST &&
      thisRole.endpointPermissions.includes(permissionId)
    ) {
      // * BlackList is superior than whitelist
      return false;
    }
    if (thisRole.setMethod === ROLE_SET_METHOD.BLACK_LIST) {
      allow = !thisRole.endpointPermissions.includes(permissionId);
    }
    if (thisRole.setMethod === ROLE_SET_METHOD.WHITE_LIST) {
      allow = thisRole.endpointPermissions.includes(permissionId);
    }
  }
  return allow;
}

export default RolePermissionResolver;
