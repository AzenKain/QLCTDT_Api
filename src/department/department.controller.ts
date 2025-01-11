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
import { DepartmentService } from './department.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateDepartmentDto, SearchDepartmentDto, UpdateDepartmentDto } from './dtos';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('department')
export class DepartmentController {
  constructor(
    private departmentService: DepartmentService
  ) {}
  @CacheTTL(30*1000)
  @Get('search')
  async searchDepartmentController(
    @Query() dto: SearchDepartmentDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.departmentService.searchDepartmentService(dto, user)
  }
  @Post('create')
  async createDepartmentController(
    @Body() dto : CreateDepartmentDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.departmentService.createDepartmentService(dto, user)
  }

  @Patch('update/:id')
  async updateDepartmentController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateDepartmentDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.departmentService.updateDepartmentService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteDepartmentController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.departmentService.deleteDepartmentService(id, user)
  }
}
