import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../types/class';
import { CreateClassDto, SearchClassDto, UpdateClassDto } from './dtos';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import { UserEntity } from '../types/user';


@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity) private classRepository: Repository<ClassEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createClassService(dto: CreateClassDto, user: UserEntity) {
    if (!user.role.administrationRule.createClass) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheClass = await this.cacheManager.get(`class:classId:${dto.classId}`);
    if (cacheClass) {
      throw new ForbiddenException(
        'This class was existed before',
      );
    }

    const checkClass = await this.classRepository.findOne({
      where: {
        classId: dto.classId,
      }
    })

    if (checkClass) {
      throw new ForbiddenException(
        'This class was existed before',
      );
    }

    const newClass = this.classRepository.create({
      classId: dto.classId,
      className: dto.className
    })

    const result =  await this.classRepository.save(newClass)
    await this.cacheManager.set(`class:id:${result.id}`, result)
    await this.cacheManager.set(`class:classId:${result.classId}`, true)
    return result
  }

  async updateClassService(id: number, dto: UpdateClassDto, user: UserEntity) {
    if (!user.role.administrationRule.editClass) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheClass = await this.getClassByIdService(id)

    const updatedClass = this.classRepository.merge(cacheClass, dto);

    const result = await this.classRepository.save(updatedClass);

    await this.cacheManager.set(`class:id:${result.id}`, result);

    return result;
  }

  async deleteClassService(id: number,user: UserEntity) {
    if (!user.role.administrationRule.editClass) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheClass = await this.getClassByIdService(id)

    cacheClass.isDisplay = false
    const result = await this.classRepository.save(cacheClass)

    await this.cacheManager.del(`class:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getClassByIdService(id: number) {
    let cacheClass : ClassEntity | undefined | null;
    cacheClass = await this.cacheManager.get(`class:id:${id}`);

    if (!cacheClass) {
      cacheClass = await this.classRepository.findOne({
        where: {
          id: id,
        }
      })
    }

    await this.cacheManager.set(`class:id:${cacheClass.id}`, cacheClass);

    if (!cacheClass) {
      throw new NotFoundException(
        'This class was not existed',
      );
    }

    return cacheClass
  }

  async searchClassService(dto: SearchClassDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupClass) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.classRepository.createQueryBuilder('class');

    query.andWhere('class.isDisplay = :isDisplay', { isDisplay: true })

    if (dto.classId) {
      query.andWhere('class.classId LIKE :classId', { classId: `%${dto.classId}%` });
    }

    if (dto.className) {
      query.andWhere('class.className LIKE :className', { className: `%${dto.className}%` });
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
      query.skip((dto.page  - 1) * dto.count).take(dto.count);
    }

    const listClass = await query.getMany();

    return {value: listClass, maxValue: maxCount}
  }
}
