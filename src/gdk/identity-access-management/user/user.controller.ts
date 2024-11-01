import {
  Controller,
  Get,
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
import { UserAddRoleDto } from './dto/user-add-role.dto';
import {
  UserDataResponseDto,
  UserFlexUpdateByIdDto,
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
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  async updateRoleListV1(@Body() addRoleDto: UserAddRoleDto) {
    return await this.userService.addRole(addRoleDto);
  }

  @Patch(`${V1}/:id`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  async updateById(
    @Param('id') id: string,
    @Body() dto: UserFlexUpdateByIdDto,
  ) {
    return await this.userService.updateById(id, dto);
  }

  @Delete(`${V1}/${USER_ROLE_LIST_PATH}`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  async removeRoleListV1(@Body() removeRoleDto: UserRemoveRoleDto) {
    return await this.userService.removeRole(removeRoleDto);
  }
}
