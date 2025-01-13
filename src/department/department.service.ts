import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { DepartmentEntity } from '../types/department';
import { ResponseType } from '../types/response.type';
import { CreateDepartmentDto, SearchDepartmentDto, UpdateDepartmentDto } from './dtos';
import { UserEntity } from '../types/user';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity) private departmentRepository: Repository<DepartmentEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }
  async createDepartmentService(dto: CreateDepartmentDto, user: UserEntity) {
    if (!user.role.administrationRule.createDepartment) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheDepartment = await this.cacheManager.get(`department:departmentId:${dto.departmentId}`);
    if (cacheDepartment) {
      throw new ForbiddenException(
        'This department was existed before',
      );
    }

    const checkDepartment = await this.departmentRepository.findOne({
      where: {
        departmentId: dto.departmentId,
      }
    })

    if (checkDepartment) {
      throw new ForbiddenException(
        'This department was existed before',
      );
    }

    const newDepartment = this.departmentRepository.create({
      departmentId: dto.departmentId,
      departmentName: dto.departmentName
    })

    const result =  await this.departmentRepository.save(newDepartment)
    await this.cacheManager.set(`department:id:${result.id}`, result)
    await this.cacheManager.set(`department:departmentId:${result.departmentId}`, true);
    return result
  }

  async updateDepartmentService(id: number, dto: UpdateDepartmentDto, user: UserEntity) {
    if (!user.role.administrationRule.editDepartment) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheDepartment = await this.getDepartmentByIdService(id)

    const updatedDepartment = this.departmentRepository.merge(cacheDepartment, dto);

    const result = await this.departmentRepository.save(updatedDepartment);

    await this.cacheManager.set(`department:id:${result.id}`, result);

    return result;
  }

  async deleteDepartmentService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.editDepartment) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheDepartment = await this.getDepartmentByIdService(id)

    cacheDepartment.isDisplay = false
    const result = await this.departmentRepository.save(cacheDepartment)

    await this.cacheManager.del(`department:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getDepartmentByIdService(id: number) {
    let cacheDepartment : DepartmentEntity | undefined | null;
    cacheDepartment = await this.cacheManager.get(`department:id:${id}`);

    if (!cacheDepartment) {
      cacheDepartment = await this.departmentRepository.findOne({
        where: {
          id: id,
        }
      })
    }

    await this.cacheManager.set(`department:id:${id}`, cacheDepartment || false);

    if (!cacheDepartment) {
      throw new NotFoundException(
        'This department was not existed',
      );
    }

    return cacheDepartment
  }

  async searchDepartmentService(dto: SearchDepartmentDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupDepartment) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.departmentRepository.createQueryBuilder('department');

    query.andWhere('department.isDisplay = :isDisplay', { isDisplay: true })

    if (dto.departmentId) {
      query.andWhere('department.departmentId LIKE :departmentId', { departmentId: `%${dto.departmentId}%` });
    }

    if (dto.departmentName) {
      query.andWhere('department.departmentName LIKE :departmentName', { departmentName: `%${dto.departmentName}%` });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('department.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('department.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('department.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('department.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page  - 1) * dto.count).take(dto.count);
    }

    const listDepartment = await query.getMany();

    return {value: listDepartment, maxValue: maxCount}
  }
}
