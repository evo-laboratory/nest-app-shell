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
import { GPI, V1 } from '@shared/statics';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthEmailSignInDto,
  AuthEmailVerificationDto,
  AuthEmailVerificationRes,
  AuthSignInRes,
  AuthVerifyDto,
  AuthVerifyRes,
  EmailSignUpDto,
  EmailSignUpRes,
  UpdateAuthDto,
} from './dto';
import {
  AUTH_API,
  EMAIL_SIGN_IN_PATH,
  EMAIL_SIGN_UP_PATH,
  EMAIL_VERIFICATION_PATH,
  SIGN_OUT_PATH,
  VERIFICATION_PATH,
} from './types';

@ApiTags(AUTH_API)
@Controller(`${GPI}/${AUTH_API}`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(`${V1}/${EMAIL_SIGN_UP_PATH}`)
  @ApiResponse({ status: 201, type: EmailSignUpRes })
  async emailSignUpV1(@Body() dto: EmailSignUpDto) {
    return await this.authService.emailSignUp(dto);
  }

  @Post(`${V1}/${VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthVerifyRes })
  async authVerificationV1(@Body() dto: AuthVerifyDto) {
    return await this.authService.verifyAuth(dto);
  }

  @Post(`${V1}/${EMAIL_VERIFICATION_PATH}`)
  @HttpCode(202)
  @ApiResponse({ status: 202, type: AuthEmailVerificationRes })
  async authEmailVerificationV1(@Body() dto: AuthEmailVerificationDto) {
    return await this.authService.emailVerification(dto);
  }

  @Post(`${V1}/${EMAIL_SIGN_IN_PATH}`)
  @ApiResponse({ status: 201, type: AuthSignInRes })
  async emailSignInV1(@Body() dto: AuthEmailSignInDto) {
    return await this.authService.emailSignIn(dto);
  }

  @Post(`${V1}/${SIGN_OUT_PATH}`)
  async signOutV1() {
    return 'ok';
  }

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
