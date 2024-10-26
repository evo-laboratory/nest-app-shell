import { ROLE_SET_METHOD } from '@gdk-system/enums';
import {
  TEST_CLIENT_ID,
  TEST_GENERAL_ROLE,
  TEST_SUPER_ROLE,
} from './test-data.static';

export function DefaultSystemData() {
  return {
    roles: [
      {
        name: TEST_SUPER_ROLE,
        setMethod: ROLE_SET_METHOD.BLACK_LIST,
        endpointPermissions: [],
        description: 'Super Admin Role',
      },
      {
        name: TEST_GENERAL_ROLE,
        setMethod: ROLE_SET_METHOD.WHITE_LIST,
        endpointPermissions: [],
        description: 'Super Admin Role',
      },
    ],
    rolesUpdatedAt: new Date(),
    endpoints: [],
    endpointUpdatedAt: new Date(),
    clients: [
      {
        id: TEST_CLIENT_ID,
        name: 'test-runner',
        willExpire: false,
        expiredAt: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    newSignUpDefaultUserRole: TEST_GENERAL_ROLE,
    clientUpdatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
