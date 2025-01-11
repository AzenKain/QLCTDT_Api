import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuardRestApi } from '../auth/guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { RoleService } from './role.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateRoleDto, SearchRoleDto, UpdateRoleDto } from './dtos';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('role')
export class RoleController {
  constructor(
    private roleService: RoleService
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchClassController(
    @Query() dto: SearchRoleDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.roleService.searchRoleService(dto, user)
  }
  @Post('create')
  async createClassController(
    @Body() dto : CreateRoleDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.roleService.createRoleService(dto, user)
  }

  @Patch('update/:id')
  async updateClassController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateRoleDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.roleService.updateRoleService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteClassController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.roleService.deleteRoleService(id, user)
  }
}
