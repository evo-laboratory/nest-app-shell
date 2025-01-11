import { AUTH_METHOD } from '@gdk-iam/auth/enums';

// * Mock output from IUnifiedOAuthUser (OauthClientService.googleAuthenticate)
export const GoogleUnifiedOAuthUserMock = {
  aud: '37889112043-94vt6f9negp6h6sgvo0qq5amaupineku.apps.googleusercontent.com',
  sourceAuthMethod: AUTH_METHOD.GOOGLE_SIGN_IN,
  sub: '117226452398209862043',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  avatarURL:
    'https://lh3.googleusercontent.com/a/ACg8ocIaC9Xwwv8OXJWWKWTE5skfXwzCtT0x52YzSWM7EUFbRd4eGOb1-A=s96-c',
};
