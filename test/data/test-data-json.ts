import { ROLE_SET_METHOD } from '@gdk-system/enums';

export const TEST_SUPER_ROLE = 'SUPER_ADMIN';
export const TEST_GENERAL_ROLE = 'GENERAL_USER';
export const TEST_CLIENT_ID = 'tester';

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
    rolesUpdatedAt: Date.now(),
    endpoints: [],
    endpointUpdatedAt: Date.now(),
    clients: [
      {
        id: TEST_CLIENT_ID,
        name: 'test-runner',
        willExpire: false,
        expiredAt: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    newSignUpDefaultUserRole: TEST_GENERAL_ROLE,
    clientUpdatedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
