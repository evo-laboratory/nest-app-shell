import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GPI, LIST_PATH, V1 } from '@shared/statics';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import { UserService } from './user.service';
import { USER_API, USER_ROLE_LIST_PATH } from './types/user.static';
import { UserAddRoleDto } from './dto/user-add-role.dto';
import {
  UserDataResponseDto,
  UserFlexUpdateByIdDto,
  UserListResponseDto,
  UserRemoveRoleDto,
} from './dto';

@ApiTags(USER_API)
@Controller(`${GPI}/${USER_API}`)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(`${V1}/${LIST_PATH}`)
  @ApiResponse({ status: 200, type: UserListResponseDto })
  @ApiOperation({
    summary: 'Listing all users',
  })
  async listAllV1(@Query() listOptions: GetListOptionsDto) {
    return await this.userService.listAll(listOptions);
  }

  @Get(`${V1}/:id`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  @ApiOperation({
    summary: 'Get user by id',
  })
  async getByIdV1(@Param('id') id: string, @Query() options: GetOptionsDto) {
    return await this.userService.getById(id, options, false);
  }

  @Patch(`${V1}/${USER_ROLE_LIST_PATH}`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  @ApiOperation({
    summary: 'Assign role to user',
  })
  async updateRoleListV1(@Body() addRoleDto: UserAddRoleDto) {
    return await this.userService.addRole(addRoleDto);
  }

  @Patch(`${V1}/:id`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  @ApiOperation({
    summary: 'Update user data by id',
  })
  async updateById(
    @Param('id') id: string,
    @Body() dto: UserFlexUpdateByIdDto,
  ) {
    return await this.userService.updateById(id, dto);
  }

  @Delete(`${V1}/${USER_ROLE_LIST_PATH}`)
  @ApiResponse({ status: 200, type: UserDataResponseDto })
  @ApiOperation({
    summary: 'Remove role from user',
  })
  async removeRoleListV1(@Body() removeRoleDto: UserRemoveRoleDto) {
    return await this.userService.removeRole(removeRoleDto);
  }
}
