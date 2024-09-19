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
import { UserService } from './user.service';
import { USER_API, USER_ROLE_LIST_PATH } from './types/user.static';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAddRoleDto } from './dto/user-add-role.dto';
import { UserRemoveRoleDto } from './dto';

@ApiTags(USER_API)
@Controller(`${GPI}/${USER_API}`)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(`${V1}`)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.removeById(id);
  }
}
