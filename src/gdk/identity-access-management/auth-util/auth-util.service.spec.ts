import { Test, TestingModule } from '@nestjs/testing';
import { AuthUtilService } from './auth-util.service';
import { ConfigType } from '@nestjs/config';
import { IAuth } from '@gdk-iam/auth/types';
import { UniteHttpException } from '@shared/exceptions';
import {
  IAuthActivities,
  IAuthSignInFailedRecordItem,
} from '@gdk-iam/auth-activities/types';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';

describe('AuthUtilService', () => {
  let service: AuthUtilService;
  let config: ConfigType<typeof identityAccessManagementConfig>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUtilService,
        {
          provide: identityAccessManagementConfig.KEY,
          useValue: {
            CODE_EXPIRE_MIN: 3,
            LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED: true,
            SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT: 5,
          },
        },
      ],
    }).compile();

    service = module.get<AuthUtilService>(AuthUtilService);
    config = module.get<ConfigType<typeof identityAccessManagementConfig>>(
      identityAccessManagementConfig.KEY,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAuthCode', () => {
    it('should generate a valid auth code', () => {
      const result = service.generateAuthCode();
      expect(result.code).toBeDefined();
      expect(result.codeExpiredAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('checkAuthAllowSignIn', () => {
    it('should throw error if auth is null', () => {
      expect(() =>
        service.checkAuthAllowSignIn('identifier', null, null),
      ).toThrow(UniteHttpException);
    });

    it('should throw error if identifier is not verified', () => {
      const auth: IAuth = {
        isIdentifierVerified: false,
        isActive: true,
      } as IAuth;
      expect(() =>
        service.checkAuthAllowSignIn('identifier', auth, null),
      ).toThrow(UniteHttpException);
    });

    it('should throw error if auth is inactive', () => {
      const auth: IAuth = {
        isIdentifierVerified: true,
        isActive: false,
      } as IAuth;
      expect(() =>
        service.checkAuthAllowSignIn('identifier', auth, null),
      ).toThrow(UniteHttpException);
    });

    it('should throw error if sign in attempts exceed limit', () => {
      const auth: IAuth = {
        isIdentifierVerified: true,
        isActive: true,
        lastChangedPasswordAt: new Date(),
      } as IAuth;
      const authActivities: IAuthActivities = {
        signInFailRecordList: [
          { createdAt: new Date() },
        ] as IAuthSignInFailedRecordItem[],
      } as IAuthActivities;
      jest.spyOn(service, 'isExceedAttemptLimit').mockReturnValue(true);
      expect(() =>
        service.checkAuthAllowSignIn('identifier', auth, authActivities),
      ).toThrow(UniteHttpException);
    });

    it('should return true if all checks pass', () => {
      const auth: IAuth = {
        isIdentifierVerified: true,
        isActive: true,
        lastChangedPasswordAt: new Date(),
      } as IAuth;
      const authActivities: IAuthActivities = {
        signInFailRecordList: [],
      } as IAuthActivities;
      expect(
        service.checkAuthAllowSignIn('identifier', auth, authActivities),
      ).toBe(true);
    });
  });

  describe('isExceedAttemptLimit', () => {
    it('should return false if LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED is false, even more than SIGN_IN_FAILED_ATTEMPT_PER_HOUR_COUNT', () => {
      config.LOCK_SIGN_IN_FAILED_ATTEMPT_EXCEED = false;
      const auth: IAuth = { lastChangedPasswordAt: new Date() } as IAuth;
      const authActivities: IAuthActivities = {
        signInFailRecordList: Array(6).fill({
          createdAt: new Date(),
        }) as IAuthSignInFailedRecordItem[],
      } as IAuthActivities;
      expect(service.isExceedAttemptLimit(auth, authActivities)).toBe(false);
    });

    it('should return true if failed attempts exceed limit', () => {
      const auth: IAuth = { lastChangedPasswordAt: new Date() } as IAuth;
      const authActivities: IAuthActivities = {
        signInFailRecordList: Array(6).fill({
          createdAt: new Date(),
        }) as IAuthSignInFailedRecordItem[],
      } as IAuthActivities;
      expect(service.isExceedAttemptLimit(auth, authActivities)).toBe(true);
    });

    it('should return false if failed attempts do not exceed limit', () => {
      const auth: IAuth = { lastChangedPasswordAt: new Date() } as IAuth;
      const authActivities: IAuthActivities = {
        signInFailRecordList: Array(4).fill({
          createdAt: new Date(),
        }) as IAuthSignInFailedRecordItem[],
      } as IAuthActivities;
      expect(service.isExceedAttemptLimit(auth, authActivities)).toBe(false);
    });
  });
});
