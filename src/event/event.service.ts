import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import { EventEntity } from 'src/types/event';
import { CreateEventDto, GetEventCurrentDto, SearchEventDto } from './dtos';
import { SchoolYearService } from '../school-year/school-year.service';
import { getEventTypeFromText } from './enum';
import { UserEntity } from '../types/user';


@Injectable()
export class EventService {
  constructor(
    private schoolYearService: SchoolYearService,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async createEventService(dto: CreateEventDto, user: UserEntity) {
    if (!user.role.administrationRule.manageEvent) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!getEventTypeFromText(dto.eventType)) {
      throw new ForbiddenException(
        'This event does not exist',
      );
    }

    if (dto.startTime > dto.endTime) {
      throw new ForbiddenException(
        'Start time must be greater than end time',
      );
    }

    const currentTime = new Date();

    const cacheEvent : EventEntity = await this.cacheManager.get(
      `event:eventType:${dto.eventType}`,
    );

    if (cacheEvent) {
      if (currentTime < cacheEvent.endTime && cacheEvent.eventStatus == true) {
        throw new ForbiddenException('An event with the same time range is already ongoing');
      }
    }

    const checkEvent = await this.eventRepository.findOne({
      where: {
        eventType: dto.eventType,
        endTime: MoreThanOrEqual(currentTime),
        eventStatus: true
      },
    });

    if (checkEvent) {
      throw new ForbiddenException('This event already exists');
    }

    const newEvent = this.eventRepository.create({
      isDisplay: true,
      eventType: dto.eventType,
      eventStatus: true,
      endTime: dto.endTime,
      startTime: dto.startTime,
      schoolYear: await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId)
    });

    const result = await this.eventRepository.save(newEvent);
    await this.cacheManager.set(`event:id:${result.id}`, result);
    await this.cacheManager.set(`event:eventType:${result.eventType}`, result);
    return result;
  }

  async disableEventService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.manageEvent) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheEvent = await this.getEventByIdService(id);

    cacheEvent.eventStatus = false;
    const result = await this.eventRepository.save(cacheEvent);

    await this.cacheManager.set(`event:id:${result.id}`, result);

    return result;
  }

  async deleteEventService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.manageEvent) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheEvent = await this.getEventByIdService(id);

    cacheEvent.isDisplay = false;
    const result = await this.eventRepository.save(cacheEvent);

    await this.cacheManager.del(`event:id:${result.id}`);

    return { status: true } as ResponseType;
  }

  async getEventByIdService(id: number) {
    let cacheEvent: EventEntity | undefined | null;
    cacheEvent = await this.cacheManager.get(`event:id:${id}`);

    if (!cacheEvent) {
      cacheEvent = await this.eventRepository.findOne({
        where: {
          id: id,
          isDisplay: true
        },
      });
    }

    await this.cacheManager.set(`event:id:${cacheEvent.id}`, cacheEvent);

    if (!cacheEvent) {
      throw new NotFoundException('This event was not existed');
    }

    return cacheEvent;
  }

  async getEventCurrentService(dto: GetEventCurrentDto) {
    const currentTime = new Date();
    let cacheEvent: EventEntity | undefined | null;
    cacheEvent = await this.cacheManager.get(`event:eventType:${dto.eventType}`);


    if (!cacheEvent || (currentTime > cacheEvent.endTime && cacheEvent.eventStatus == true)) {
      cacheEvent = await this.eventRepository.findOne({
        where: {
          eventType: dto.eventType,
          eventStatus: true,
          startTime: LessThanOrEqual(currentTime),
          endTime: LessThanOrEqual(currentTime),
          isDisplay: true
        },
      });
    }

    await this.cacheManager.set(`event:eventType:${cacheEvent.eventType}`, cacheEvent);

    return cacheEvent;
  }

  async searchEventService(dto: SearchEventDto, user: UserEntity) {
    if (!user.role.administrationRule.manageEvent) {
      throw new ForbiddenException('Role forbidden');
    }

    const query = this.eventRepository.createQueryBuilder('event')
    .leftJoinAndSelect('event.schoolYear', 'schoolYear');

    query.andWhere('event.isDisplay = :isDisplay', { isDisplay: true });

    if (dto.eventType) {
      query.andWhere('event.eventType LIKE :eventType', {
        eventType: `%${dto.eventType}%`,
      });
    }

    if (dto.schoolYearId) {
      query.andWhere('schoolYear.id = :schoolYearId', { schoolYearId: `%${dto.schoolYearId}%` });
    }

    if (dto.startTime) {
      query.andWhere('event.startTime >= :startTime', { startTime: dto.startTime });
    }

    if (dto.endTime) {
      query.andWhere('event.endTime <= :endTime', { endTime: dto.endTime });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('user.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('user.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('user.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('user.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page - 1) * dto.count).take(dto.count);
    }

    const listEvent = await query.getMany();

    return { value: listEvent, maxValue: maxCount };
  }
}
