import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import { SubjectEntity } from '../types/subject';
import { CreateSubjectDto, SearchSubjectDto, UpdateSubjectDto } from './dtos';
import { DepartmentService } from '../department/department.service';
import { UserEntity } from '../types/user';
import { EventType } from '../event/enum';
import { EventService } from '../event/event.service';

@Injectable()
export class SubjectService {
  constructor(
    private departmentService: DepartmentService,
    private eventService: EventService,
    @InjectRepository(SubjectEntity)
    private subjectRepository: Repository<SubjectEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createSubjectService(dto: CreateSubjectDto, user: UserEntity) {
    if (!user.role.administrationRule.createSubject) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateSubject, schoolYearId: -1})) {
      throw new ForbiddenException('This time is not allowed create program!');
    }

    const existSubject = await this.cacheManager.get(
      `subject:subjectId:${dto.subjectId}`,
    );
    if (existSubject) {
      throw new ForbiddenException('This subject was existed before');
    }

    const cacheSubject = await this.subjectRepository.findOne({
      where: {
        subjectId: dto.subjectId
      },
    });

    if (cacheSubject) {
      throw new ForbiddenException('This subject was existed before');
    }

    const newSubject = this.subjectRepository.create({
      subjectId: dto.subjectId,
      subjectName: dto.subjectName,
      credits: dto.credits,
      theoreticalHours: dto.theoreticalHours,
      practicalHours: dto.practicalHours,
      coefficient: dto.coefficient
    });

    newSubject.department = await this.departmentService.getDepartmentByIdService(dto.departmentId)

    newSubject.prerequisiteCourses = await this.getSubjectsByIdsService(dto.prerequisiteCourses)

    newSubject.equivalentCourses = await this.getSubjectsByIdsService(dto.equivalentCourses)

    const result = await this.subjectRepository.save(newSubject);
    await this.cacheManager.set(`subject:id:${result.id}`, result);
    await this.cacheManager.set(`subject:subjectId:${dto.subjectId}`, result);

    return result;
  }

  async updateSubjectService(id: number, dto: UpdateSubjectDto, user: UserEntity) {
    if (!user.role.administrationRule.editSubject) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateSubject, schoolYearId: -1})) {
      throw new ForbiddenException('This time is not allowed create program!');
    }

    const cacheSubject = await this.getSubjectByIdService(id);

    cacheSubject.subjectId = dto.subjectId ? dto.subjectId : cacheSubject.subjectId
    cacheSubject.subjectName = dto.subjectName ? dto.subjectName : cacheSubject.subjectName

    cacheSubject.credits = dto.credits ? dto.credits : cacheSubject.credits
    cacheSubject.theoreticalHours = dto.theoreticalHours ? dto.theoreticalHours : cacheSubject.theoreticalHours
    cacheSubject.practicalHours = dto.practicalHours ? dto.practicalHours : cacheSubject.practicalHours
    cacheSubject.coefficient = dto.coefficient ? dto.coefficient : cacheSubject.coefficient

    if (dto.departmentId && dto.departmentId !== cacheSubject.department.id) {
      cacheSubject.department = await this.departmentService.getDepartmentByIdService(dto.departmentId)
    }

    if (dto.prerequisiteCourses) {
      cacheSubject.prerequisiteCourses = await this.getSubjectsByIdsService(dto.prerequisiteCourses)

    }
    if (dto.equivalentCourses) {
      cacheSubject.equivalentCourses = await this.getSubjectsByIdsService(dto.equivalentCourses)
    }

    const result = await this.subjectRepository.save(cacheSubject);

    await this.cacheManager.set(`subject:id:${result.id}`, result);

    return result;
  }

  async deleteSubjectService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.editSubject) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateSubject, schoolYearId: -1})) {
      throw new ForbiddenException('This time is not allowed create program!');
    }

    const cacheSubject = await this.getSubjectByIdService(id);

    cacheSubject.isDisplay = false;
    const result = await this.subjectRepository.save(cacheSubject);

    await this.cacheManager.del(`subject:id:${result.id}`);

    return { status: true } as ResponseType;
  }

  async getSubjectBySubjectIdService(subjectId: string) {
    let cacheSubject: SubjectEntity | undefined | null;
    cacheSubject = await this.cacheManager.get(`subject:subjectId:${subjectId}`);

    if (!cacheSubject) {
      cacheSubject = await this.subjectRepository.findOne({
        where: {
          subjectId: subjectId,
        },
        relations: [
          'department',
          'prerequisiteCourses',
          'equivalentCourses'
        ]
      });
    }

    await this.cacheManager.set(`subject:subjectId:${subjectId}`, cacheSubject || false);

    if (!cacheSubject) {
      throw new NotFoundException('This subject was not existed');
    }

    return cacheSubject;
  }

  async getSubjectsBySubjectIdsService(subjectIds: string[]) {
    const subjectsMap = new Map<string, SubjectEntity>();
    const missingSubjectIds: string[] = [];

    for (const subjectId of subjectIds) {
      const cacheSubject: SubjectEntity | null = await this.cacheManager.get(`subject:subjectId:${subjectId}`);
      if (!cacheSubject) {
        missingSubjectIds.push(subjectId);
      } else {
        subjectsMap.set(subjectId, cacheSubject);
      }
    }

    if (missingSubjectIds.length > 0) {
      const fetchedSubjects = await this.subjectRepository.find({
        where: {
          subjectId: In(missingSubjectIds),
        },
        relations: [
          'department',
          'prerequisiteCourses',
          'equivalentCourses',
        ],
      });

      for (const subject of fetchedSubjects) {
        await this.cacheManager.set(`subject:subjectId:${subject.subjectId}`, subject);
        subjectsMap.set(subject.subjectId, subject);
      }
    }

    if (subjectsMap.size === 0) {
      throw new NotFoundException('No subjects were found for the given subject IDs');
    }

    const subjects = subjectIds.map((id) => {
      const subject = subjectsMap.get(id);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} was not found`);
      }
      return subject;
    });

    return subjects;
  }


  async getSubjectByIdService(id: number) {
    let cacheSubject: SubjectEntity | undefined | null;
    cacheSubject = await this.cacheManager.get(`subject:id:${id}`);

    if (!cacheSubject) {
      cacheSubject = await this.subjectRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'department',
          'prerequisiteCourses',
          'equivalentCourses'
        ]
      });
    }

    await this.cacheManager.set(`subject:id:${id}`, cacheSubject || false);

    if (!cacheSubject) {
      throw new NotFoundException('This subject was not existed');
    }

    return cacheSubject;
  }

  async getSubjectsByIdsService(ids: number[]) {
    const subjectsMap = new Map<number, SubjectEntity>();
    const missingIds: number[] = [];

    for (const id of ids) {
      const cacheSubject: SubjectEntity | null = await this.cacheManager.get(`subject:id:${id}`);
      if (!cacheSubject) {
        missingIds.push(id);
      } else {
        subjectsMap.set(id, cacheSubject);
      }
    }

    if (missingIds.length > 0) {
      const fetchedSubjects = await this.subjectRepository.find({
        where: {
          id: In(missingIds),
        },
        relations: [
          'department',
          'prerequisiteCourses',
          'equivalentCourses',
        ],
      });

      for (const subject of fetchedSubjects) {
        await this.cacheManager.set(`subject:id:${subject.id}`, subject);
        subjectsMap.set(subject.id, subject);
      }
    }

    if (subjectsMap.size === 0) {
      throw new NotFoundException('No subjects were found for the given IDs');
    }

    const subjects = ids.map((id) => {
      const subject = subjectsMap.get(id);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} was not found`);
      }
      return subject;
    });

    return subjects;
  }

  async searchSubjectService(dto: SearchSubjectDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupSubject) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.subjectRepository.createQueryBuilder('subject')
      .leftJoinAndSelect('subject.department', 'department')
      .leftJoinAndSelect('subject.prerequisiteCourses', 'prerequisiteCourses')
      .leftJoinAndSelect('subject.equivalentCourses', 'equivalentCourses');

    query.andWhere('subject.isDisplay = :isDisplay', { isDisplay: true });

    if (dto.subjectId) {
      query.andWhere('subject.subjectId LIKE :subjectId', {
        subjectId: `%${dto.subjectId}%`,
      });
    }

    if (dto.subjectName) {
      query.andWhere('subject.subjectName LIKE :subjectName', {
        subjectName: `%${dto.subjectName}%`,
      });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('subject.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('subject.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('subject.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('subject.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page - 1) * dto.count).take(dto.count);
    }

    const listSubject = await query.getMany();

    return { value: listSubject, maxValue: maxCount };
  }
}
