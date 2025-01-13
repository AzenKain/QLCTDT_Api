import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import {
  AdministrationRuleEntity,
  InformationLookupRuleEntity,
  PersonalRuleEntity,
  RoleEntity,
} from '../types/role';
import { CreateRoleDto, SearchRoleDto, UpdateRoleDto } from './dtos';
import { UserEntity } from '../types/user';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity) private roleRepository: Repository<RoleEntity>,
    @InjectRepository(PersonalRuleEntity) private personalRuleRepository: Repository<PersonalRuleEntity>,
    @InjectRepository(InformationLookupRuleEntity) private infoRuleRepository: Repository<InformationLookupRuleEntity>,
    @InjectRepository(AdministrationRuleEntity) private adminRuleRepository: Repository<AdministrationRuleEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createRoleService(dto: CreateRoleDto, user: UserEntity) {
    if (!user.role.administrationRule.createUserGroup) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheRole = await this.cacheManager.get(`role:roleId:${dto.roleId}`);
    if (cacheRole) {
      throw new ForbiddenException(
        'This role was existed before',
      );
    }

    const checkRole = await this.roleRepository.findOne({
      where: {
        roleId: dto.roleId,
      }
    })

    if (checkRole) {
      throw new ForbiddenException(
        'This role was existed before',
      );
    }
    const personRule = this.personalRuleRepository.create()
    const infoRule = this.infoRuleRepository.create()
    const adminRule = this.adminRuleRepository.create()

    const newRole = this.roleRepository.create({
      roleId: dto.roleId,
      roleName: dto.roleName,
      description: dto.description,
      personalRule: await this.personalRuleRepository.save(personRule),
      informationLookupRule: await this.infoRuleRepository.save(infoRule),
      administrationRule: await this.adminRuleRepository.save(adminRule)
    })

    const result =  await this.roleRepository.save(newRole)
    await this.cacheManager.set(`role:id:${result.id}`, result)
    await this.cacheManager.set(`role:roleId:${result.roleId}`, true)

    return result
  }

  async updateRoleService(id: number, dto: UpdateRoleDto, user: UserEntity) {
    if (!user.role.administrationRule.editUserGroup) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheRole = await this.getRoleByIdService(id)

    cacheRole.roleId = dto.roleId ? dto.roleId : cacheRole.roleId;
    cacheRole.roleName = dto.roleName ? dto.roleName : cacheRole.roleName;

    if (dto.personalRule || dto.informationLookupRule || dto.administrationRule) {
      if (!user.role.administrationRule.assignPermission) {
        throw new ForbiddenException('Role forbidden');
      }
    }

    if (dto.personalRule) {
      const updatedTemp = this.personalRuleRepository.merge(cacheRole.personalRule, dto.personalRule);
      cacheRole.personalRule = await this.personalRuleRepository.save(updatedTemp);
    }

    if (dto.informationLookupRule) {
      const updatedTemp = this.infoRuleRepository.merge(cacheRole.informationLookupRule, dto.informationLookupRule);
      cacheRole.informationLookupRule = await this.infoRuleRepository.save(updatedTemp);
    }

    if (dto.administrationRule) {
      const updatedTemp = this.adminRuleRepository.merge(cacheRole.administrationRule, dto.administrationRule);
      cacheRole.administrationRule = await this.adminRuleRepository.save(updatedTemp);
    }

    const result = await this.roleRepository.save(cacheRole);

    await this.cacheManager.set(`role:id:${result.id}`, result);

    return result;
  }

  async deleteRoleService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.deleteUserGroup) {
      throw new ForbiddenException('Role forbidden');
    }

    const cacheRole = await this.getRoleByIdService(id)

    cacheRole.isDisplay = false
    const result = await this.roleRepository.save(cacheRole)

    await this.cacheManager.del(`role:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getRoleByIdService(id: number) {
    let cacheRole : RoleEntity | undefined | null;
    cacheRole = await this.cacheManager.get(`role:id:${id}`);

    if (!cacheRole) {
      cacheRole = await this.roleRepository.findOne({
        where: {
          id: id,
        }
      })
    }

    await this.cacheManager.set(`role:id:${id}`, cacheRole || false);

    if (!cacheRole) {
      throw new NotFoundException(
        'This role was not existed',
      );
    }

    return cacheRole
  }

  async searchRoleService(dto: SearchRoleDto, user: UserEntity) {
    if (!user.role.administrationRule.lookupUserGroup) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.roleRepository.createQueryBuilder('role');

    query.andWhere('role.isDisplay = :isDisplay', { isDisplay: true })

    if (dto.roleId) {
      query.andWhere('role.roleId LIKE :roleId', { roleId: `%${dto.roleId}%` });
    }

    if (dto.roleName) {
      query.andWhere('role.roleName LIKE :roleName', { roleName: `%${dto.roleName}%` });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('role.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('role.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('role.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('role.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page  - 1) * dto.count).take(dto.count);
    }

    const listRole = await query.getMany();

    return {value: listRole, maxValue: maxCount}
  }
}
