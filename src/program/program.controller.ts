import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuardRestApi } from '../auth/guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ProgramService } from './program.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateProgramDto, SearchProgramDto, StatusProgramDto, UpdateProgramDto } from './dtos';

@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('program')
export class ProgramController {
  constructor(
    private programService: ProgramService
  ) {
  }

  @CacheTTL(30*1000)
  @Get('search')
  async searchProgramController(
    @Query() dto: SearchProgramDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.searchProgramService(dto, user)
  }
  @Post('create')
  async createProgramController(
    @Body() dto : CreateProgramDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.createProgramService(dto, user)
  }

  @Post('read-file')
  async createProgramByFileController(
    @UploadedFile() file: Express.Multer.File,
    @Body('schoolYearId', ParseIntPipe) dto : number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.createProgramByFileService(file, user, dto)
  }

  @Patch('update-draft/:id')
  async updateDraftProgramController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateProgramDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.updateDraftProgramService(id, dto, user)
  }

  @Patch('update-request/:id')
  async updateRequestProgramController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : UpdateProgramDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.updateRequestProgramService(id, dto, user)
  }

  @Patch('status/:id')
  async statusProgramController(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto : StatusProgramDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.statusProgramService(id, dto, user)
  }

  @Delete('delete/:id')
  async deleteProgramController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.programService.deleteProgramService(id, user)
  }
}
