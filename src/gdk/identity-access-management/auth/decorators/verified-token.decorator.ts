import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthDecodedToken } from '../types';

export const VerifiedToken = createParamDecorator(
  (field: keyof IAuthDecodedToken | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token: IAuthDecodedToken | undefined = request[VERIFIED_JWT_KEY];
    return field ? token?.[field] : token;
  },
);
