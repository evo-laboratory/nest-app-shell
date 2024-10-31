import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { USER_API, USER_ROLE_LIST_PATH } from './types/user.static';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAddRoleDto } from './dto/user-add-role.dto';
import {
  UserDataResponseDto,
  UserListResponseDto,
  UserRemoveRoleDto,
} from './dto';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';

@ApiTags(USER_API)
@Controller(`${GPI}/${USER_API}`)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(`${V1}/${LIST_PATH}`)
  @ApiResponse({ status: 200, type: UserListResponseDto })
  async listAllV1(@Query() listOptions: GetListOptionsDto) {
    return await this.userService.listAll(listOptions);
  }

  @Get(`${V1}/:id`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  async getByIdV1(@Param('id') id: string, @Query() options: GetOptionsDto) {
    return await this.userService.getById(id, options, false);
  }

  @Patch(`${V1}/${USER_ROLE_LIST_PATH}`)
  updateRoleListV1(@Body() addRoleDto: UserAddRoleDto) {
    return this.userService.addRole(addRoleDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateById(id, updateUserDto);
  }

  @Delete(`${V1}/${USER_ROLE_LIST_PATH}`)
  removeRoleListV1(@Body() removeRoleDto: UserRemoveRoleDto) {
    return this.userService.removeRole(removeRoleDto);
  }
}
