import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import { MajorEntity } from '../types/major';
import { CreateMajorDto, SearchMajorDto, UpdateMajorDto } from './dtos';
import { UserEntity } from '../types/user';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(MajorEntity) private majorRepository: Repository<MajorEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }
  async createMajorService(dto: CreateMajorDto,user: UserEntity) {
    if (!user.role.administrationRule.createMajor) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheMajor = await this.cacheManager.get(`major:majorId:${dto.majorId}`);
    if (cacheMajor) {
      throw new ForbiddenException(
        'This major was existed before',
      );
    }

    const checkMajor = await this.majorRepository.findOne({
      where: {
        majorId: dto.majorId,
      }
    })

    if (checkMajor) {
      throw new ForbiddenException(
        'This major was existed before',
      );
    }

    const newEvent = this.majorRepository.create({
      majorId: dto.majorId,
      majorName: dto.majorName
    })

    const result =  await this.majorRepository.save(newEvent)
    await this.cacheManager.set(`major:id:${result.id}`, result)
    await this.cacheManager.set(`major:majorId:${result.majorId}`, result);
    return result
  }

  async updateMajorService(id: number, dto: UpdateMajorDto, user: UserEntity) {
    if (!user.role.administrationRule.editMajor) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheMajor = await this.getMajorByIdService(id)

    const updatedMajor = this.majorRepository.merge(cacheMajor, dto);

    const result = await this.majorRepository.save(updatedMajor);

    await this.cacheManager.set(`major:id:${result.id}`, result);

    return result;
  }

  async deleteMajorService(id: number,  user: UserEntity) {
    if (!user.role.administrationRule.editMajor) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheMajor = await this.getMajorByIdService(id)

    cacheMajor.isDisplay = false
    const result = await this.majorRepository.save(cacheMajor)

    await this.cacheManager.del(`major:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getMajorByIdService(id: number) {
    let cacheMajor : MajorEntity | undefined | null;
    cacheMajor = await this.cacheManager.get(`major:id:${id}`);

    if (!cacheMajor) {
      cacheMajor = await this.majorRepository.findOne({
        where: {
          id: id,
        }
      })
    }

    await this.cacheManager.set(`major:id:${id}`, cacheMajor || false);

    if (!cacheMajor) {
      throw new NotFoundException(
        'This major was not existed',
      );
    }

    return cacheMajor
  }
  async getMajorByMajorIdService(majorId: string) {
    let cacheMajor : MajorEntity | undefined | null;
    cacheMajor = await this.cacheManager.get(`major:majorId:${majorId}`);

    if (!cacheMajor) {
      cacheMajor = await this.majorRepository.findOne({
        where: {
          majorId: majorId,
        }
      })
    }

    await this.cacheManager.set(`major:majorId:${majorId}`, cacheMajor || false);

    if (!cacheMajor) {
      throw new NotFoundException(
        'This major was not existed',
      );
    }

    return cacheMajor
  }
  async searchMajorService(dto: SearchMajorDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupMajor) {
      throw new ForbiddenException('Role forbidden');
    }

    const query = this.majorRepository.createQueryBuilder('major');

    query.andWhere('major.isDisplay = :isDisplay', { isDisplay: true })

    if (dto.majorId) {
      query.andWhere('major.majorId LIKE :majorId', { majorId: `%${dto.majorId}%` });
    }

    if (dto.majorName) {
      query.andWhere('major.majorName LIKE :majorName', { majorName: `%${dto.majorName}%` });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('major.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('major.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('major.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('major.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page  - 1) * dto.count).take(dto.count);
    }

    const listMajor = await query.getMany();

    return {value: listMajor, maxValue: maxCount}
  }
}
