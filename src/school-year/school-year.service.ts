import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import { SchoolYearEntity } from '../types/schoolYear';
import { CreateSchoolYearDto, SearchSchoolYearDto, UpdateSchoolYearDto } from './dtos';
import { UserEntity } from '../types/user';


@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYearEntity) private schoolYearRepository: Repository<SchoolYearEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createSchoolYearService(dto: CreateSchoolYearDto, user: UserEntity) {
    if (!user.role.administrationRule.createSchoolYear) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheSchoolYear = await this.cacheManager.get(`schoolYear:schoolYearId:${dto.schoolYearId}`);
    if (cacheSchoolYear) {
      throw new ForbiddenException(
        'This school year was existed before',
      );
    }


    const checkSchoolYear = await this.schoolYearRepository.findOne({
      where: {
        schoolYearId: dto.schoolYearId,
      }
    })

    if (checkSchoolYear) {
      throw new ForbiddenException(
        'This school year was existed before',
      );
    }

    const newSchoolYear = this.schoolYearRepository.create({
      schoolYearId: dto.schoolYearId,
      schoolYearName: dto.schoolYearName,
      startYear: dto.startYear,
      endYear: dto.endYear,
    })

    const result =  await this.schoolYearRepository.save(newSchoolYear)
    await this.cacheManager.set(`schoolYear:id:${result.id}`, result)
    await this.cacheManager.set(`schoolYear:schoolYearId:${result.schoolYearId}`, result);

    return result
  }

  async updateSchoolYearService(id: number, dto: UpdateSchoolYearDto, user: UserEntity) {
    if (!user.role.administrationRule.editSchoolYear) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheSchoolYear = await this.getSchoolYearByIdService(id)

    const updatedSchoolYear = this.schoolYearRepository.merge(cacheSchoolYear, dto);

    const result = await this.schoolYearRepository.save(updatedSchoolYear);

    await this.cacheManager.set(`schoolYear:id:${result.id}`, result);

    return result;
  }

  async deleteSchoolYearService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.editSchoolYear) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheSchoolYear = await this.getSchoolYearByIdService(id)

    cacheSchoolYear.isDisplay = false
    const result = await this.schoolYearRepository.save(cacheSchoolYear)

    await this.cacheManager.del(`schoolYear:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getSchoolYearByIdService(id: number) {
    let cacheSchoolYear : SchoolYearEntity | undefined | null;
    cacheSchoolYear = await this.cacheManager.get(`schoolYear:id:${id}`);

    if (!cacheSchoolYear) {
      cacheSchoolYear = await this.schoolYearRepository.findOne({
        where: {
          id: id,
        }
      })
    }

    await this.cacheManager.set(`schoolYear:id:${cacheSchoolYear.id}`, cacheSchoolYear);

    if (!cacheSchoolYear) {
      throw new NotFoundException(
        'This school year was not existed',
      );
    }

    return cacheSchoolYear
  }
  async getSchoolYearBySchoolYearIdService(schoolYearId: string) {
    let cacheSchoolYear : SchoolYearEntity | undefined | null;
    cacheSchoolYear = await this.cacheManager.get(`schoolYear:schoolYearId:${schoolYearId}`);

    if (!cacheSchoolYear) {
      cacheSchoolYear = await this.schoolYearRepository.findOne({
        where: {
          schoolYearId: schoolYearId,
        }
      })
    }

    await this.cacheManager.set(`schoolYear:schoolYearId:${cacheSchoolYear.schoolYearId}`, cacheSchoolYear);

    if (!cacheSchoolYear) {
      throw new NotFoundException(
        'This school year was not existed',
      );
    }

    return cacheSchoolYear
  }

  async searchSchoolYearService(dto: SearchSchoolYearDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupSchoolYear) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.schoolYearRepository.createQueryBuilder('schoolYear');

    query.andWhere('schoolYear.isDisplay = :isDisplay', { isDisplay: true })

    if (dto.schoolYearId) {
      query.andWhere('schoolYear.schoolYearId LIKE :schoolYearId', { schoolYearId: `%${dto.schoolYearId}%` });
    }

    if (dto.schoolYearName) {
      query.andWhere('schoolYear.schoolYearName LIKE :schoolYearName', { schoolYearName: `%${dto.schoolYearName}%` });
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

    const listSchoolYear = await query.getMany();

    return {value: listSchoolYear, maxValue: maxCount}
  }
}
