import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { JwtGuardRestApi } from '../auth/guard';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateClassDto, SearchClassDto, UpdateClassDto } from './dtos';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('class')
export class ClassController {
  constructor(
    private classService: ClassService,
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchClassController(
    @Query() dto: SearchClassDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.classService.searchClassService(dto, user)
  }
  @Post('create')
  async createClassController(
    @Body() dto : CreateClassDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.classService.createClassService(dto, user)
  }

  @Patch('update/:id')
  async updateClassController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateClassDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.classService.updateClassService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteClassController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.classService.deleteClassService(id, user)
  }
}
