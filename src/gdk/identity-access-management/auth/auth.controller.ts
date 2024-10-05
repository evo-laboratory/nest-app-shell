import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CHECK_PATH, GPI, LIST_PATH, V1 } from '@shared/statics';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import { AuthService } from './auth.service';
import {
  AuthCheckRefreshTokenDto,
  AuthCheckResult,
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthEmailVerificationRes,
  AuthExchangeNewAccessTokenDto,
  AuthExchangeNewAccessTokenRes,
  AuthGetByIdResDto,
  AuthListAuthResDto,
  AuthSignInRes,
  AuthSignOutDto,
  AuthSignOutRes,
  AuthSocialSignInUpDto,
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
  SOCIAL_SIGN_IN_UP_PATH,
  VERIFICATION_PATH,
} from './types';
import { AuthType, AuthZType, VerifiedToken } from './decorators';
import { AUTHZ_TYPE } from './enums';

@ApiTags(AUTH_API)
@Controller(`${GPI}/${AUTH_API}`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_SIGN_UP_PATH}`)
  @ApiResponse({ status: 201, type: EmailSignUpRes })
  async emailSignUpV1(@Body() dto: EmailSignUpDto) {
    return await this.authService.emailSignUp(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthVerifyRes })
  async authVerificationV1(@Body() dto: AuthVerifyDto) {
    return await this.authService.verifyAuth(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthEmailVerificationRes })
  async authEmailVerificationV1(@Body() dto: AuthEmailVerificationDto) {
    return await this.authService.emailVerification(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_SIGN_IN_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  async emailSignInV1(@Body() dto: AuthEmailSignInDto) {
    return await this.authService.emailSignIn(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${SOCIAL_SIGN_IN_UP_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  async socialSignInUpV1(@Body() dto: AuthSocialSignInUpDto) {
    return await this.authService.socialEmailSignInUp(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @AuthZType(AUTHZ_TYPE.USER)
  @Post(`${V1}/${ACCESS_TOKEN_PATH}`)
  @ApiResponse({ type: AuthExchangeNewAccessTokenRes })
  async exchangeNewAccessTokenV1(@Body() dto: AuthExchangeNewAccessTokenDto) {
    return await this.authService.exchangeAccessToken(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${CHECK_PATH}/${REFRESH_TOKEN_PATH}`)
  @ApiResponse({ status: 202, type: AuthCheckResult })
  async checkRefreshTokenStateV1(@Body() dto: AuthCheckRefreshTokenDto) {
    // * We don't want to return decodedToken, force pass second arg false
    return await this.authService.verifyRefreshToken(dto, false);
  }

  @AuthZType(AUTHZ_TYPE.USER)
  @Post(`${V1}/${SIGN_OUT_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthSignOutRes })
  async signOutV1(
    @VerifiedToken() token: IAuthDecodedToken,
    @Body() dto: AuthSignOutDto,
  ) {
    return await this.authService.signOut(token.sub, dto);
  }

  @Get(`${V1}/${LIST_PATH}`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthListAuthResDto })
  async listAllV1(@Query() listOptions: GetListOptionsDto) {
    console.log(listOptions);
    return await this.authService.listAll(listOptions);
  }

  @Get(`${V1}/:id`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthGetByIdResDto })
  async getByIdV1(@Param('id') id: string, @Query() options: GetOptionsDto) {
    return await this.authService.getById(id, options, false);
  }

  // TODO LogLevel in ENV
  // TODO Revoke Refresh token by admin
  // TODO Disable Auth
  // TODO Delete Auth and User
  // TODO 3rd party OAuth Login
  // TODO Implement Event(Auth) webhooks / triggers
  // TODO User APIs
  // TODO E2E testing

  @Get()
  findAll() {
    // return this.authService.findAll();
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
