export enum AUTHZ_TYPE {
  ROLE = 'ROLE',
  USER = 'USER', // * This won't check Role, but will check if is a valid user.
}
