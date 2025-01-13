import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserEntity } from '../types/user';
import { RoleService } from '../role/role.service';
import { MajorService } from '../major/major.service';
import { ClassService } from '../class/class.service';
import { ResponseType } from '../types/response.type';
import { SchoolYearService } from '../school-year/school-year.service';
import { DepartmentService } from '../department/department.service';
import * as argon from 'argon2';
import { v5 as uuidv5 } from 'uuid';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from './dtos';
import { getGenderTypeFromText, getPositionTypeFromText } from './enum';

@Injectable()
export class UserService {

  constructor(
    private roleService: RoleService,
    private classService: ClassService,
    private majorService: MajorService,
    private schoolYearService: SchoolYearService,
    private departmentService: DepartmentService,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createUserService(dto: CreateUserDto, user:UserEntity) {
    if (!user.role.administrationRule.createUser) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheUser = await this.cacheManager.get(`user:userId:${dto.userId}:email:${dto.email}`);

    if (cacheUser) {
      throw new ForbiddenException(
        'This user was existed before',
      );
    }

    if (!getGenderTypeFromText(dto.gender)) {
      throw new ForbiddenException(
        'This gender does not exist',
      );
    }

    if (!getPositionTypeFromText(dto.position)) {
      throw new ForbiddenException(
        'This position does not exist',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { userId: dto.userId },
        { email: dto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.userId === dto.userId) {
        throw new ForbiddenException('This user was existed before');
      }
      if (existingUser.email === dto.email) {
        throw new ForbiddenException('This email was existed before');
      }
    }

    const hash = await argon.hash(dto.password);
    const role = await this.roleService.getRoleByIdService(dto.roleId)

    const newUser = this.userRepository.create({
      secretKey: uuidv5(dto.email, uuidv5.URL),
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      hash: hash,
      position: dto.position,
      role: role
    })


    if (dto.roleId) {
      newUser.role = await this.roleService.getRoleByIdService(dto.roleId)
    }

    if (dto.pastMajorId) {
      newUser.pastMajor = await this.majorService.getMajorByIdService(dto.pastMajorId)
    }

    if (dto.currentMajorId) {
      newUser.currentMajor = await this.majorService.getMajorByIdService(dto.currentMajorId)
    }

    if (dto.secondMajorId) {
      newUser.secondMajor = await this.majorService.getMajorByIdService(dto.secondMajorId)
    }

    if (dto.classId) {
      newUser.class = await this.classService.getClassByIdService(dto.classId)
    }

    if (dto.schoolYearId) {
      newUser.schoolYear = await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId)
    }

    if (dto.departmentId) {
      newUser.department = await this.departmentService.getDepartmentByIdService(dto.departmentId)
    }

    const result =  await this.userRepository.save(newUser)
    await this.cacheManager.set(`user:id:${result.id}`, result)
    await this.cacheManager.set(`user:userId:${result.userId}:email${result.email}`, true);

    return result
  }

  async updateUserService(id: number, dto: UpdateUserDto, user:UserEntity) {
    if (!user.role.administrationRule.editUser) {
      throw new ForbiddenException('Role forbidden');
    }
    if (dto.gender && !getGenderTypeFromText(dto.gender)) {
      throw new ForbiddenException(
        'This gender does not exist',
      );
    }

    if (dto.position && !getPositionTypeFromText(dto.position)) {
      throw new ForbiddenException(
        'This position does not exist',
      );
    }

    const cacheUser = await this.getUserByIdService(id)

    cacheUser.gender = dto.gender ? dto.gender : cacheUser.gender;
    cacheUser.firstName = dto.firstName ? dto.firstName : cacheUser.firstName;
    cacheUser.lastName = dto.lastName ? dto.lastName : cacheUser.lastName;
    cacheUser.position = dto.position ? dto.position : cacheUser.position;

    if (dto.email || dto.userId) {
      const conditions = [];
      if (dto.userId && dto.userId !== cacheUser.userId) {
        conditions.push({ userId: dto.userId });
      }
      if (dto.email && dto.email !== cacheUser.email) {
        conditions.push({ email: dto.email });
      }


      if (conditions.length > 0) {
        const existingUser = await this.userRepository.findOne({
          where: conditions,
        });

        if (existingUser) {
          if (dto.userId && existingUser.userId === dto.userId) {
            throw new ForbiddenException('This userId is already in use');
          }
          if (dto.email && existingUser.email === dto.email) {
            throw new ForbiddenException('This email is already in use');
          }
        }
      }

      if (dto.email) {
        cacheUser.email = dto.email;
      }

      if (dto.userId) {
        cacheUser.userId = dto.userId;
      }
    }

    if (dto.pastMajorId) {
      cacheUser.pastMajor = await this.majorService.getMajorByIdService(dto.pastMajorId)
    }

    if (dto.currentMajorId) {
      cacheUser.currentMajor = await this.majorService.getMajorByIdService(dto.currentMajorId)
    }

    if (dto.secondMajorId) {
      cacheUser.secondMajor = await this.majorService.getMajorByIdService(dto.secondMajorId)
    }

    if (dto.classId) {
      cacheUser.class = await this.classService.getClassByIdService(dto.classId)
    }

    if (dto.schoolYearId) {
      cacheUser.schoolYear = await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId)
    }

    if (dto.departmentId) {
      cacheUser.department = await this.departmentService.getDepartmentByIdService(dto.departmentId)
    }

    const result = await this.userRepository.save(cacheUser);

    await this.cacheManager.set(`user:id:${result.id}`, result);

    return result;
  }

  async deleteUserService(id: number, user: UserEntity) {
    if (!user.role.administrationRule.editUser) {
      throw new ForbiddenException('Role forbidden');
    }
    const cacheUser = await this.getUserByIdService(id)

    cacheUser.isDisplay = false
    const result = await this.userRepository.save(cacheUser)

    await this.cacheManager.del(`user:id:${result.id}`);

    return { status : true} as ResponseType
  }

  async getUserByIdService(id: number) {
    let cacheUser : UserEntity | undefined | null
    cacheUser = await this.cacheManager.get(`user:id:${id}`);

    if (!cacheUser) {
      cacheUser = await this.userRepository.findOne({
        where: {
          id: id,
          isDisplay: true
        },
        relations: [
          'role',
          'class',
          'pastMajor',
          'currentMajor',
          'secondMajor',
          'department',
          'schoolYear',
          'role.personalRule',
          'role.informationLookupRule',
          'role.administrationRule',
        ]
      })
    }

    if (cacheUser) {
      delete cacheUser.hash;
      delete cacheUser.refreshToken;
    }

    await this.cacheManager.set(`user:id:${id}`, cacheUser || false);

    if (!cacheUser) {
      throw new NotFoundException(
        'This user was not existed',
      );
    }

    return cacheUser
  }

  async getUserByEmailService(email: string) {
    let cacheUser : UserEntity | undefined | null
    cacheUser = await this.cacheManager.get(`user:email:${email}`);

    if (!cacheUser) {
      cacheUser = await this.userRepository.findOne({
        where: {
          email: email,
          isDisplay: true
        },
        relations: [
          'role',
          'class',
          'pastMajor',
          'currentMajor',
          'secondMajor',
          'department',
          'schoolYear',
          'role.personalRule',
          'role.informationLookupRule',
          'role.administrationRule',
        ]
      })
    }

    await this.cacheManager.set(`user:email:${email}`, cacheUser || false);


    if (!cacheUser) {
      throw new NotFoundException(
        'This user was not existed',
      );
    }

    return cacheUser
  }

  async getUserBySecretKeyService(secretKey: string) {
    let cacheUser : UserEntity | undefined | null
    cacheUser = await this.cacheManager.get(`user:secretKey:${secretKey}`);

    if (!cacheUser) {
      cacheUser = await this.userRepository.findOne({
        where: {
          secretKey: secretKey,
          isDisplay: true
        },
        relations: [
          'role',
          'class',
          'pastMajor',
          'currentMajor',
          'secondMajor',
          'department',
          'schoolYear',
          'role.personalRule',
          'role.informationLookupRule',
          'role.administrationRule',
        ]
      })
    }

    if (cacheUser) {
      delete cacheUser.hash;
      delete cacheUser.refreshToken;
    }

    await this.cacheManager.set(`user:secretKey:${secretKey}`, cacheUser || false);

    return cacheUser
  }

  async getUserForJwtService(email: string, secretKey: string) {

    let cacheUser : UserEntity | undefined | null
    cacheUser = await this.cacheManager.get(`user:email:${email}:secret:${secretKey}`);

    if (cacheUser === undefined) {
      cacheUser = await this.userRepository.findOne({
        where: {
          email: email,
          secretKey: secretKey,
          isDisplay: true
        },
        relations: [
          'class',
          'pastMajor',
          'currentMajor',
          'secondMajor',
          'department',
          'schoolYear',
          'role',
          'role.personalRule',
          'role.informationLookupRule',
          'role.administrationRule',
        ]
      })
    }

    if (cacheUser) {
      delete cacheUser.hash;
      delete cacheUser.refreshToken;
    }

    await this.cacheManager.set(`user:email:${email}:secret:${secretKey}`, cacheUser || false);

    return cacheUser
  }

  async searchUserService(dto: SearchUserDto, user:UserEntity) {
    if (!user.role.administrationRule.lookupUser) {
      throw new ForbiddenException('Role forbidden');
    }
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.class', 'class')
      .leftJoinAndSelect('user.pastMajor', 'pastMajor')
      .leftJoinAndSelect('user.currentMajor', 'currentMajor')
      .leftJoinAndSelect('user.secondMajor', 'secondMajor')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.schoolYear', 'schoolYear')

    // query.andWhere('user.isDisplay = :isDisplay', { isDisplay: true });

    if (dto.userId) {
      query.andWhere('user.userId LIKE :userId', { userId: `%${dto.userId}%` });
    }

    if (dto.firstName) {
      query.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${dto.firstName}%`,
      });
    }

    if (dto.lastName) {
      query.andWhere('user.lastName LIKE :lastName', {
        lastName: `%${dto.lastName}%`,
      });
    }

    if (dto.roleId) {
      query.andWhere('role.id = :roleId', { roleId: dto.roleId });
    }

    if (dto.position) {
      query.andWhere('user.position LIKE :position', {
        position: `%${dto.position}%`,
      });
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

    const listUsers = await query.getMany();

    for (const tmpUser of listUsers) {
      delete tmpUser.hash;
      delete tmpUser.refreshToken;
    }

    return { value: listUsers, maxValue: maxCount };
  }

}
