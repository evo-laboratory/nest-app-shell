import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GPI, V1 } from '@shared/statics';
import { ApiTags } from '@nestjs/swagger';
import { AUTH_API, EMAIL_SIGNUP_PATH } from './types/auth.static';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EmailSignUpDto } from './dto/email-signup.dto';
@ApiTags(AUTH_API)
@Controller(`${GPI}/${AUTH_API}`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(`${V1}/${EMAIL_SIGNUP_PATH}`)
  async create(@Body() dto: EmailSignUpDto) {
    return await this.authService.emailSignUp(dto);
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
