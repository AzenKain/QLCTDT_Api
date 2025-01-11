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
import { SchoolYearService } from './school-year.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateSchoolYearDto, SearchSchoolYearDto, UpdateSchoolYearDto } from './dtos';


@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('school-year')
export class SchoolYearController {
  constructor(
    private schoolYearService : SchoolYearService
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchSchoolYearController(
    @Query() dto: SearchSchoolYearDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.schoolYearService.searchSchoolYearService(dto, user)
  }

  @Post('create')
  async createSchoolYearController(
    @Body() dto : CreateSchoolYearDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.schoolYearService.createSchoolYearService(dto, user)
  }

  @Patch('update/:id')
  async updateSchoolYearController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateSchoolYearDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.schoolYearService.updateSchoolYearService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteSchoolYearController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.schoolYearService.deleteSchoolYearService(id, user)
  }
}
