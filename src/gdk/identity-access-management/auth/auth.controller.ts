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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ACTIVATING_PATH,
  CHECK_PATH,
  DEACTIVATING_PATH,
  GPI,
  LIST_PATH,
  SELF_PATH,
  V1,
} from '@shared/statics';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import { AuthRevokedTokenService } from '@gdk-iam/auth-revoked-token/auth-revoked-token.service';
import { AUTH_REVOKED_TOKEN_SOURCE } from '@gdk-iam/auth-revoked-token/enums';
import { AuthService } from './auth.service';
import {
  AuthCheckRefreshTokenDto,
  AuthCheckResult,
  AuthDataResponseDto,
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthEmailVerificationRes,
  AuthExchangeNewAccessTokenDto,
  AuthExchangeNewAccessTokenRes,
  AuthListResDto,
  AuthSignInRes,
  AuthSignOutDto,
  AuthSignOutRes,
  AuthSocialSignInUpDto,
  AuthVerifyDto,
  AuthVerifyRes,
  EmailSignUpDto,
  EmailSignUpRes,
} from './dto';
import { AuthType, AuthZType, VerifiedToken } from './decorators';
import { AUTH_TYPE, AUTHZ_TYPE } from './enums';
import {
  AuthRevokeRefreshTokenDto,
  AuthRevokeRefreshTokenRes,
} from '@gdk-iam/auth-revoked-token/dto';
import {
  ACCESS_TOKEN_PATH,
  AUTH_API,
  EMAIL_PATH,
  EMAIL_SIGN_IN_PATH,
  EMAIL_SIGN_UP_PATH,
  EMAIL_VERIFICATION_PATH,
  IDENTIFIER_PATH,
  REFRESH_TOKEN_PATH,
  REVOKE_REFRESH_TOKEN_PATH,
  SIGN_OUT_PATH,
  SOCIAL_SIGN_IN_UP_PATH,
  VERIFICATION_PATH,
  VERIFIED_EMAIL_SIGN_UP_PATH,
} from './statics';
import { IAuthDecodedToken } from './types';

@ApiTags(AUTH_API)
@Controller(`${GPI}/${AUTH_API}`)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authRevokedTokenService: AuthRevokedTokenService,
  ) {}

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_SIGN_UP_PATH}`)
  @ApiResponse({ status: 201, type: EmailSignUpRes })
  @ApiOperation({
    summary: 'General user sign-up process',
  })
  async emailSignUpV1(@Body() dto: EmailSignUpDto) {
    // * General user sign-up process, we don't want it to be isAlreadyVerified
    return await this.authService.emailSignUp(dto, false);
  }

  @Post(`${V1}/${VERIFIED_EMAIL_SIGN_UP_PATH}`)
  @ApiResponse({ status: 201, type: EmailSignUpRes })
  @ApiOperation({
    summary: 'Verified email sign-up process, commonly using from Admin',
  })
  async verifiedEmailSignUpV1(@Body() dto: EmailSignUpDto) {
    // * Verified email sign-up process, commonly using from Admin, set isAlreadyVerified = true
    return await this.authService.emailSignUp(dto, true);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthVerifyRes })
  @ApiOperation({
    summary:
      'Verify auth, can be used for verify sign-up and change password after initial forgot password',
  })
  async authVerificationV1(@Body() dto: AuthVerifyDto) {
    return await this.authService.verifyAuth(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthEmailVerificationRes })
  @ApiOperation({
    summary:
      'Initial email verification, can be used for email verification(email sign-up process) and forgot password',
  })
  async authEmailVerificationV1(@Body() dto: AuthEmailVerificationDto) {
    return await this.authService.emailVerification(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${EMAIL_SIGN_IN_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  @ApiOperation({
    summary: 'General email sign in process',
  })
  async emailSignInV1(@Body() dto: AuthEmailSignInDto) {
    return await this.authService.emailSignIn(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${SOCIAL_SIGN_IN_UP_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  @ApiOperation({
    summary: 'Social email sign in process thru oauth2',
  })
  async socialSignInUpV1(@Body() dto: AuthSocialSignInUpDto) {
    return await this.authService.socialEmailSignInUp(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${ACCESS_TOKEN_PATH}`)
  @ApiResponse({ type: AuthExchangeNewAccessTokenRes })
  @ApiOperation({
    summary: 'Use refresh token to exchange new access token',
  })
  async exchangeNewAccessTokenV1(@Body() dto: AuthExchangeNewAccessTokenDto) {
    return await this.authService.exchangeAccessToken(dto);
  }

  @AuthType(AUTH_TYPE.PUBLIC)
  @Post(`${V1}/${CHECK_PATH}/${REFRESH_TOKEN_PATH}`)
  @ApiResponse({ status: 202, type: AuthCheckResult })
  @ApiOperation({
    summary: 'Check refresh token state',
  })
  async checkRefreshTokenStateV1(@Body() dto: AuthCheckRefreshTokenDto) {
    // * We don't want to return decodedToken, force pass second arg false
    return await this.authService.verifyRefreshToken(dto, false);
  }

  @AuthZType(AUTHZ_TYPE.USER)
  @Post(`${V1}/${SIGN_OUT_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthSignOutRes })
  @ApiOperation({
    summary: 'Signout auth, revoke refresh token',
  })
  async signOutV1(
    @VerifiedToken() token: IAuthDecodedToken,
    @Body() dto: AuthSignOutDto,
  ) {
    return await this.authRevokedTokenService.revokeRefreshToken(
      token,
      dto,
      AUTH_REVOKED_TOKEN_SOURCE.USER_SIGN_OUT,
    );
  }

  @AuthZType(AUTHZ_TYPE.USER)
  @Post(`${V1}/${REVOKE_REFRESH_TOKEN_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthRevokeRefreshTokenRes })
  @ApiOperation({
    summary:
      'Force signout auth, revoke refresh token (normally used by admin)',
  })
  async revokeRefreshTokenV1(
    @VerifiedToken() token: IAuthDecodedToken,
    @Body() dto: AuthRevokeRefreshTokenDto,
  ) {
    return await this.authRevokedTokenService.revokeRefreshToken(
      token,
      dto,
      AUTH_REVOKED_TOKEN_SOURCE.ADMIN,
    );
  }

  @Get(`${V1}/${LIST_PATH}`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthListResDto })
  @ApiOperation({
    summary: 'Listing all auth',
  })
  async listAllV1(@Query() listOptions: GetListOptionsDto) {
    console.log(listOptions);
    return await this.authService.listAll(listOptions);
  }

  @Get(`${V1}/${EMAIL_PATH}/:email`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Get auth by email',
  })
  async getByEmailV1(
    @Param('email') email: string,
    @Query() options: GetOptionsDto,
  ) {
    return await this.authService.getByEmail(email, options, false);
  }

  @Get(`${V1}/${IDENTIFIER_PATH}/:identifier`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Get auth by identifier',
  })
  async getByIdentifierV1(
    @Param('identifier') identifier: string,
    @Query() options: GetOptionsDto,
  ) {
    return await this.authService.getByIdentifier(identifier, options, false);
  }

  @Get(`${V1}/:id`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Get auth by id',
  })
  async getByIdV1(@Param('id') id: string, @Query() options: GetOptionsDto) {
    return await this.authService.getById(id, options, false);
  }

  @Patch(`${V1}/${ACTIVATING_PATH}/:id`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Activate auth by id',
  })
  async activateByIdV1(@Param('id') id: string) {
    return await this.authService.activateById(id);
  }

  @Patch(`${V1}/${DEACTIVATING_PATH}/:id`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Deactivate auth by id',
  })
  async deactivateByIdV1(@Param('id') id: string) {
    return await this.authService.deactivateById(id);
  }

  @AuthZType(AUTHZ_TYPE.USER)
  @Delete(`${V1}/${SELF_PATH}`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Self delete auth',
  })
  async selfDeleteV1(@VerifiedToken() token: IAuthDecodedToken) {
    return this.authService.deleteById(token.sub, true);
  }

  @Delete(`${V1}/:id`)
  @HttpCode(200)
  @ApiResponse({ status: 200, type: AuthDataResponseDto })
  @ApiOperation({
    summary: 'Delete auth by id',
  })
  async deleteByIdV1(@Param('id') id: string) {
    return this.authService.deleteById(id, false);
  }
  // TODO Implement Event(Auth) webhooks / triggers
}
