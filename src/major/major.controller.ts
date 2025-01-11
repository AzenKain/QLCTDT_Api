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
import { MajorService } from './major.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateMajorDto, SearchMajorDto, UpdateMajorDto } from './dtos';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('major')
export class MajorController {
  constructor(
    private majorService: MajorService
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchMajorController(
    @Query() dto: SearchMajorDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.majorService.searchMajorService(dto, user)
  }

  @Post('create')
  async createMajorController(
    @Body() dto : CreateMajorDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.majorService.createMajorService(dto, user)
  }

  @Patch('update/:id')
  async updateMajorController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateMajorDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.majorService.updateMajorService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteMajorController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.majorService.deleteMajorService(id, user)
  }
}
