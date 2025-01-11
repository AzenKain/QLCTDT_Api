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
import { EventService } from './event.service';
import { CurrentUserAccess } from '../decorators';
import { UserEntity } from '../types/user';
import { CreateEventDto, GetEventCurrentDto, SearchEventDto } from './dtos';


@UseGuards(JwtGuardRestApi)
@UseInterceptors(CacheInterceptor)
@Controller('event')
export class EventController {
  constructor(
    private eventService: EventService
  ) {}

  @CacheTTL(30*1000)
  @Get('search')
  async searchEventController(
    @Query() dto: SearchEventDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.eventService.searchEventService(dto, user)
  }

  @CacheTTL(30*1000)
  @Get('current')
  async getEventCurrentController(
    @Query() dto: GetEventCurrentDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.eventService.getEventCurrentService(dto)
  }

  @Post('create')
  async createEventController(
    @Body() dto : CreateEventDto,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.eventService.createEventService(dto, user)
  }

  @Patch('disable/:id')
  async disableEventController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.eventService.disableEventService(id, user)
  }

  @Delete('delete/:id')
  async deleteEventController(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserAccess() user: UserEntity
  ) {
    return await this.eventService.deleteEventService(id, user)
  }
}
