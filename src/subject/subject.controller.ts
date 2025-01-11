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
import { SubjectService } from './subject.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateSubjectDto, SearchSubjectDto, UpdateSubjectDto } from './dtos';


@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('subject')
export class SubjectController {
  constructor(private subjectService: SubjectService) {}

  @CacheTTL(30 * 1000)
  @Get('search')
  async searchSubjectController(
    @Query() dto: SearchSubjectDto,
    @CurrentUserAccess() user: UserEntity,
  ) {
    return await this.subjectService.searchSubjectService(dto, user);
  }

  @Post('create')
  async createSubjectController(
    @Body() dto: CreateSubjectDto,
    @CurrentUserAccess() user: UserEntity,
  ) {
    return await this.subjectService.createSubjectService(dto, user);
  }

  @Patch('update/:id')
  async updateSubjectController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
    @CurrentUserAccess() user: UserEntity,
  ) {
    return await this.subjectService.updateSubjectService(id, dto, user);
  }

  @Delete('delete/:id')
  async deleteSubjectController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity,
  ) {
    return await this.subjectService.deleteSubjectService(id, user);
  }
}
