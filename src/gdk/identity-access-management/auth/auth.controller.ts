import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { CHECK_PATH, GPI, V1 } from '@shared/statics';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthEmailVerificationRes,
  AuthSignInRes,
  AuthSignOutRes,
  AuthVerifyDto,
  AuthVerifyRes,
  EmailSignUpDto,
  EmailSignUpRes,
  UpdateAuthDto,
} from './dto';
import {
  ACCESS_TOKEN_PATH,
  AUTH_API,
  AUTH_TYPE,
  EMAIL_SIGN_IN_PATH,
  EMAIL_SIGN_UP_PATH,
  EMAIL_VERIFICATION_PATH,
  IAuthDecodedToken,
  REFRESH_TOKEN_PATH,
  SIGN_OUT_PATH,
  VERIFICATION_PATH,
} from './types';
import { AuthType } from './decorators/auth-type.decorator';
import { VerifiedToken } from './decorators/verified-token.decorator';
import { AuthSignOutDto } from './dto/auth-sign-out.dto';
import { AuthExchangeNewAccessTokenDto } from './dto/auth-exchange-new-access-token.dto';
import { AuthCheckRefreshTokenDto } from './dto/auth-check-refresh-token.dto';

@ApiTags(AUTH_API)
@Controller(`${GPI}/${AUTH_API}`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${EMAIL_SIGN_UP_PATH}`)
  @ApiResponse({ status: 201, type: EmailSignUpRes })
  async emailSignUpV1(@Body() dto: EmailSignUpDto) {
    return await this.authService.emailSignUp(dto);
  }

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthVerifyRes })
  async authVerificationV1(@Body() dto: AuthVerifyDto) {
    return await this.authService.verifyAuth(dto);
  }

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${EMAIL_VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthEmailVerificationRes })
  async authEmailVerificationV1(@Body() dto: AuthEmailVerificationDto) {
    return await this.authService.emailVerification(dto);
  }

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${EMAIL_SIGN_IN_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  async emailSignInV1(@Body() dto: AuthEmailSignInDto) {
    return await this.authService.emailSignIn(dto);
  }

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${ACCESS_TOKEN_PATH}`)
  async exchangeNewAccessTokenV1(@Body() dto: AuthExchangeNewAccessTokenDto) {
    // TODO Implement renew access token from refresh token
    return dto;
  }

  @AuthType(AUTH_TYPE.NONE)
  @Post(`${V1}/${CHECK_PATH}/${REFRESH_TOKEN_PATH}`)
  async checkRefreshTokenStateV1(@Body() dto: AuthCheckRefreshTokenDto) {
    // TODO Implement check refresh token is revoked or not
    return dto;
  }

  @Post(`${V1}/${SIGN_OUT_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthSignOutRes })
  async signOutV1(
    @VerifiedToken() token: IAuthDecodedToken,
    @Body() dto: AuthSignOutDto,
  ) {
    console.log(dto);
    return await this.authService.signOut(token.sub, dto);
  }

  // TODO List All Auth
  // TODO Find Auth ById
  // TODO Revoke Refresh token by admin
  // TODO Disable Auth
  // TODO Delete Auth and User
  // TODO Implement API Key
  // TODO Implement AuthorizationGuard (different approaches)
  // TODO 3rd party OAuth Login
  // TODO Google Login
  // TODO FB Login
  // TODO Github Login
  // TODO Implement Event(Auth) webhooks / triggers
  // TODO User APIs
  // TODO E2E testing

  @Get()
  findAll() {
    // return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    // return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.authService.remove(+id);
  }
}
