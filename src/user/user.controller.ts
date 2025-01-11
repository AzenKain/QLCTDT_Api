import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post, Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuardRestApi } from '../auth/guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CurrentUserAccess } from '../decorators';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from './dtos';
import { UserEntity } from '../types/user';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchUserController(
    @Query() dto: SearchUserDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.userService.searchUserService(dto, user)
  }

  @CacheTTL(30*1000)
  @Get('current')
  async getUserCurrentController(
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.userService.getUserBySecretKeyService(user.secretKey)
  }

  @Post('create')
  async createUserController(
    @Body() dto : CreateUserDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.userService.createUserService(dto, user)
  }

  @Patch('update/:id')
  async updateUserController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateUserDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.userService.updateUserService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteUserController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.userService.deleteUserService(id, user)
  }
}
