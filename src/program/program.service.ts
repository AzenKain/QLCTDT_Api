import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResponseType } from '../types/response.type';
import {
  CreateProgramDto,
  SearchProgramDto,
  StatusProgramDto,
  UpdateProgramDto,
} from './dtos';
import {
  ProgramDetailEntity,
  ProgramEntity,
  ProgramStatusHistoryEntity,
} from '../types/program';
import { MajorService } from '../major/major.service';
import { SchoolYearService } from '../school-year/school-year.service';
import { SubjectService } from '../subject/subject.service';
import { UserEntity } from '../types/user';
import {
  canTransitionTo,
  canUseAction,
  getProgramStatusFromText,
  ProgramStage,
  ProgramStatus,
} from './status';
import fs from 'fs';
import csv from 'csv-parser';
import unidecode from 'unidecode';
import { EventService } from '../event/event.service';
import { EventType } from '../event/enum';

interface ColumnData {
  programName: string[];                    // Tên chương trình đào tạo
  majors: string[];                         // Ngành
  schoolYears: string[];                    // Khóa
  generalSubjects: string[];                // Học phần đại cương
  coreSubjects: string[];                   // Học phần thuộc cơ sở khối ngành
  majorRequiredSubjects: string[];          // Học phần thuộc bắt buộc của ngành
  majorElectiveSubjects: string[];          // Học phần thuộc lựa chọn của ngành
  internshipOrGraduationSubjects: string[]; // Thực tập, tốt nghiệp
  freeElectiveSubjects: string[];           // Lựa chọn tự do
}

@Injectable()
export class ProgramService {
  constructor(
    private majorService: MajorService,
    private schoolYearService: SchoolYearService,
    private subjectService: SubjectService,
    private eventService: EventService,
    @InjectRepository(ProgramEntity)
    private programRepository: Repository<ProgramEntity>,
    @InjectRepository(ProgramDetailEntity)
    private programDetailRepository: Repository<ProgramDetailEntity>,
    @InjectRepository(ProgramStatusHistoryEntity)
    private programHistoryRepository: Repository<ProgramStatusHistoryEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async createProgramService(dto: CreateProgramDto, user: UserEntity) {
    if (!user.role.informationLookupRule.createProgram) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramDraft, schoolYearId: dto.schoolYearId})) {
      throw new ForbiddenException('This time is not allowed create program!');
    }

    const newProgram = this.programRepository.create({
      status: ProgramStatus.Created,
      isDisplay: true,
    });

    // save status
    const newStatus = this.programHistoryRepository.create({
      user: user,
      previousStatus: ProgramStatus.None,
      newStatus: ProgramStatus.Created,
    });

    newProgram.statusHistory = [
      await this.programHistoryRepository.save(newStatus),
    ];

    //save details
    const draftDetail = this.programDetailRepository.create({
      programName: dto.programName,
    });

    draftDetail.major = await this.majorService.getMajorByIdService(dto.majorId);

    draftDetail.schoolYear = await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId);

    draftDetail.generalSubjects = await this.subjectService.getSubjectsByIdsService(dto.generalSubjects)

    draftDetail.coreSubjects = await this.subjectService.getSubjectsByIdsService(dto.coreSubjects)

    draftDetail.majorRequiredSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorRequiredSubjects)

    draftDetail.majorElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorElectiveSubjects)

    draftDetail.internshipOrGraduationSubjects = await this.subjectService.getSubjectsByIdsService(dto.internshipOrGraduationSubjects)

    draftDetail.freeElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.freeElectiveSubjects)

    newProgram.draft = await this.programDetailRepository.save(draftDetail);

    const result = await this.programRepository.save(newProgram);

    await this.cacheManager.set(`program:id:${result.id}`, result);
    return result;
  }

  async createProgramByFileService(file: Express.Multer.File, user: UserEntity, schoolYearId: number) {
    if (!user.role.informationLookupRule.importProgram) {
      throw new ForbiddenException('Role forbidden');
    }

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramDraft, schoolYearId: schoolYearId})) {
      throw new ForbiddenException('This time is not allowed create program!');
    }

    const dto: ColumnData = {
      programName: [],
      majors: [],
      schoolYears: [],
      generalSubjects: [],
      coreSubjects: [],
      majorRequiredSubjects: [],
      majorElectiveSubjects: [],
      internshipOrGraduationSubjects: [],
      freeElectiveSubjects: [],
    };

    fs.createReadStream(file.path, { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (row) => {
        const cleanedRow: { [key: string]: string } = {};

        Object.entries(row).forEach(([key, value]) => {
          const cleanedKey = unidecode(key.trim());
          if (typeof value === 'string') {
            cleanedRow[cleanedKey] = value;
          }
        });

        if (cleanedRow['Ten chuong trinh dao tao']?.trim()) {
          dto.programName.push(cleanedRow['Ten chuong trinh dao tao']);
        }

        if (cleanedRow['Nganh']?.trim()) {
          dto.majors.push(cleanedRow['Nganh']);
        }

        if (cleanedRow['Khoa']?.trim()) {
          dto.schoolYears.push(cleanedRow['Khoa']);
        }

        if (cleanedRow['Hoc phan dai cuong']?.trim()) {
          dto.generalSubjects.push(cleanedRow['Hoc phan dai cuong']);
        }

        if (cleanedRow['Hoc phan thuoc co so khoi nganh']?.trim()) {
          dto.coreSubjects.push(cleanedRow['Hoc phan thuoc co so khoi nganh']);
        }

        if (cleanedRow['Hoc phan thuoc bat buoc cua nganh']?.trim()) {
          dto.majorRequiredSubjects.push(cleanedRow['Hoc phan thuoc bat buoc cua nganh']);
        }

        if (cleanedRow['Hoc phan thuoc lua chon cua nganh']?.trim()) {
          dto.majorElectiveSubjects.push(cleanedRow['Hoc phan thuoc lua chon cua nganh']);
        }

        if (cleanedRow['Thuc tap, tot nghiep']?.trim()) {
          dto.internshipOrGraduationSubjects.push(cleanedRow['Thuc tap, tot nghiep']);
        }

        if (cleanedRow['Lua chon tu do']?.trim()) {
          dto.freeElectiveSubjects.push(cleanedRow['Lua chon tu do']);
        }
      })

    //save details
    const draftDetail = this.programDetailRepository.create({
      programName: dto.programName[0],
    });

    draftDetail.major = await this.majorService.getMajorByMajorIdService(dto.majors[0]);

    draftDetail.schoolYear = await this.schoolYearService.getSchoolYearBySchoolYearIdService(dto.schoolYears[0]);

    draftDetail.generalSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.generalSubjects)

    draftDetail.coreSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.coreSubjects)

    draftDetail.majorRequiredSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.majorRequiredSubjects)

    draftDetail.majorElectiveSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.majorElectiveSubjects)

    draftDetail.internshipOrGraduationSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.internshipOrGraduationSubjects)

    draftDetail.freeElectiveSubjects = await this.subjectService.getSubjectsBySubjectIdsService(dto.freeElectiveSubjects)

    return draftDetail;
  }

  async statusProgramService(
    id: number,
    dto: StatusProgramDto,
    user: UserEntity,
  ) {

    const cacheProgram = await this.getProgramByIdService(id);

    const currentStatus = getProgramStatusFromText(cacheProgram.status);
    if (!currentStatus) {
      throw new ForbiddenException('Current status is not valid');
    }

    const nextStatus = getProgramStatusFromText(dto.status);
    if (!currentStatus) {
      throw new ForbiddenException('Next status is not valid');
    }

    if (!canTransitionTo(currentStatus, nextStatus)) {
      throw new ForbiddenException(
        'Cannot transition from current status to next status',
      );
    }

    if (nextStatus === ProgramStatus.Pending) {
      if (!user.role.informationLookupRule.sendApprovalRequest) {
        throw new ForbiddenException('Role forbidden');
      }
      if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramDraft, schoolYearId: dto.schoolYearId})) {
        throw new ForbiddenException('This time is not allowed request program!');
      }

      const requestDetail = this.programDetailRepository.create({
        programName: cacheProgram.draft.programName,
        major: cacheProgram.draft.major,
        schoolYear: cacheProgram.draft.schoolYear,
        generalSubjects: cacheProgram.draft.generalSubjects,
        coreSubjects: cacheProgram.draft.coreSubjects,
        majorRequiredSubjects: cacheProgram.draft.majorRequiredSubjects,
        majorElectiveSubjects: cacheProgram.draft.majorElectiveSubjects,
        internshipOrGraduationSubjects: cacheProgram.draft.internshipOrGraduationSubjects,
        freeElectiveSubjects: cacheProgram.draft.freeElectiveSubjects,
      });

      cacheProgram.request = await this.programDetailRepository.save(requestDetail);
    }
    else {
      if (!user.role.informationLookupRule.approveRequest) {
        throw new ForbiddenException('Role forbidden');
      }
      if (!await this.eventService.getEventCurrentService({eventType: EventType.ApproveRequest, schoolYearId: dto.schoolYearId})) {
        throw new ForbiddenException('This time is not allowed request program!');
      }
    }

    const newStatus = this.programHistoryRepository.create({
      user: user,
      previousStatus: ProgramStatus.None,
      newStatus: ProgramStatus.Created,
    });

    cacheProgram.statusHistory.push(
      await this.programHistoryRepository.save(newStatus),
    );

    const result = await this.programRepository.save(cacheProgram);

    await this.cacheManager.set(`program:id:${result.id}`, result);

    return result;
  }

  async updateDraftProgramService(id: number, dto: UpdateProgramDto, user: UserEntity)  {
    if (!user.role.informationLookupRule.editProgramDraft) {
      throw new ForbiddenException('Role forbidden');
    }


    const cacheProgram = await this.getProgramByIdService(id);

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramDraft, schoolYearId: cacheProgram.draft.schoolYear.id})) {
      throw new ForbiddenException('This time is not allowed edit draft program!');
    }

    const currentStatus = getProgramStatusFromText(cacheProgram.status);
    if (!currentStatus) {
      throw new ForbiddenException('Current status is not valid');
    }

    if (!canUseAction(currentStatus, ProgramStage.Draft)) {
      throw new ForbiddenException('Cannot use this feature for this program');
    }

    cacheProgram.draft.programName = dto.programName ? dto.programName : cacheProgram.draft.programName;

    if (dto.majorId && dto.majorId !== cacheProgram.draft.major.id) {
      cacheProgram.draft.major = await this.majorService.getMajorByIdService(dto.majorId);
    }

    if (
      dto.schoolYearId &&
      dto.schoolYearId !== cacheProgram.draft.schoolYear.id
    ) {
      cacheProgram.draft.schoolYear = await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId);
    }

    if (dto.generalSubjects) {
      cacheProgram.draft.generalSubjects = await this.subjectService.getSubjectsByIdsService(dto.generalSubjects)
    }

    if (dto.coreSubjects) {
      cacheProgram.draft.coreSubjects = await this.subjectService.getSubjectsByIdsService(dto.coreSubjects)
    }

    if (dto.majorRequiredSubjects) {
      cacheProgram.draft.majorRequiredSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorRequiredSubjects)
    }

    if (dto.majorElectiveSubjects) {
      cacheProgram.draft.majorElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorElectiveSubjects)
    }

    if (dto.internshipOrGraduationSubjects) {
      cacheProgram.draft.internshipOrGraduationSubjects = await this.subjectService.getSubjectsByIdsService(dto.internshipOrGraduationSubjects)
    }

    if (dto.freeElectiveSubjects) {
      cacheProgram.draft.freeElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.freeElectiveSubjects)
    }
    const result = await this.programRepository.save(cacheProgram);

    await this.cacheManager.set(`program:id:${result.id}`, result);

    return result;
  }

  async updateRequestProgramService(id: number, dto: UpdateProgramDto, user: UserEntity)  {
    if (!user.role.informationLookupRule.editProgramDraft) {
      throw new ForbiddenException('Role forbidden');
    }



    const cacheProgram = await this.getProgramByIdService(id);

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramRequest, schoolYearId: cacheProgram.request.schoolYear.id})) {
      throw new ForbiddenException('This time is not allowed edit draft program!');
    }

    const currentStatus = getProgramStatusFromText(cacheProgram.status);
    if (!currentStatus) {
      throw new ForbiddenException('Current status is not valid');
    }

    if (!canUseAction(currentStatus, ProgramStage.Request)) {
      throw new ForbiddenException('Cannot use this feature for this program');
    }

    cacheProgram.request.programName = dto.programName ? dto.programName : cacheProgram.request.programName;

    if (dto.majorId && dto.majorId !== cacheProgram.request.major.id) {
      cacheProgram.request.major = await this.majorService.getMajorByIdService(dto.majorId);
    }

    if (
      dto.schoolYearId &&
      dto.schoolYearId !== cacheProgram.request.schoolYear.id
    ) {
      cacheProgram.request.schoolYear = await this.schoolYearService.getSchoolYearByIdService(dto.schoolYearId);
    }

    if (dto.generalSubjects) {
      cacheProgram.request.generalSubjects = await this.subjectService.getSubjectsByIdsService(dto.generalSubjects)
    }

    if (dto.coreSubjects) {
      cacheProgram.request.coreSubjects = await this.subjectService.getSubjectsByIdsService(dto.coreSubjects)
    }

    if (dto.majorRequiredSubjects) {
      cacheProgram.request.majorRequiredSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorRequiredSubjects)
    }

    if (dto.majorElectiveSubjects) {
      cacheProgram.request.majorElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.majorElectiveSubjects)
    }

    if (dto.internshipOrGraduationSubjects) {
      cacheProgram.request.internshipOrGraduationSubjects = await this.subjectService.getSubjectsByIdsService(dto.internshipOrGraduationSubjects)
    }

    if (dto.freeElectiveSubjects) {
      cacheProgram.request.freeElectiveSubjects = await this.subjectService.getSubjectsByIdsService(dto.freeElectiveSubjects)
    }

    const result = await this.programRepository.save(cacheProgram);

    await this.cacheManager.set(`program:id:${result.id}`, result);

    return result;
  }

  async deleteProgramService(id: number, user: UserEntity) {
    if (!user.role.informationLookupRule.deleteProgramDraft) {
      throw new ForbiddenException('Role forbidden');
    }


    const cacheProgram = await this.getProgramByIdService(id);

    if (!await this.eventService.getEventCurrentService({eventType: EventType.UpdateProgramDraft, schoolYearId: cacheProgram.draft.schoolYear.id})) {
      throw new ForbiddenException('This time is not allowed edit program!');
    }

    cacheProgram.draft.isDisplay = false;

    const result = await this.programRepository.save(cacheProgram);

    await this.cacheManager.del(`program:id:${result.id}`);

    return { status: true } as ResponseType;
  }

  async getProgramByIdService(id: number) {
    let cacheProgram: ProgramEntity | undefined | null;
    cacheProgram = await this.cacheManager.get(`program:id:${id}`);

    if (!cacheProgram) {
      cacheProgram = await this.programRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'draft',
          'draft.major',
          'draft.schoolYear',
          'draft.generalSubjects',
          'draft.coreSubjects',
          'draft.majorRequiredSubjects',
          'draft.majorElectiveSubjects',
          'draft.internshipOrGraduationSubjects',
          'draft.freeElectiveSubjects',
          'request',
          'request.major',
          'request.schoolYear',
          'request.generalSubjects',
          'request.coreSubjects',
          'request.majorRequiredSubjects',
          'request.majorElectiveSubjects',
          'request.internshipOrGraduationSubjects',
          'request.freeElectiveSubjects',
          'statusHistory',
          'statusHistory.user'
        ],
      });
    }

    await this.cacheManager.set(`program:id:${id}`, cacheProgram || false);

    if (!cacheProgram) {
      throw new NotFoundException('This program was not existed');
    }

    return cacheProgram;
  }

  async searchProgramService(dto: SearchProgramDto, user:UserEntity) {
    if (!user.role.informationLookupRule.viewProgram) {
      throw new ForbiddenException('Role forbidden');
    }

    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.draft', 'draft')
      .leftJoinAndSelect('draft.major', 'draftMajor')
      .leftJoinAndSelect('draft.schoolYear', 'draftSchoolYear')
      .leftJoinAndSelect('draft.generalSubjects', 'draftGeneralSubjects')
      .leftJoinAndSelect('draft.coreSubjects', 'draftCoreSubjects')
      .leftJoinAndSelect('draft.majorRequiredSubjects', 'draftMajorRequiredSubjects')
      .leftJoinAndSelect('draft.majorElectiveSubjects', 'draftMajorElectiveSubjects')
      .leftJoinAndSelect('draft.internshipOrGraduationSubjects', 'draftInternshipOrGraduationSubjects')
      .leftJoinAndSelect('draft.freeElectiveSubjects', 'draftFreeElectiveSubjects')
      .leftJoinAndSelect('program.request', 'request')
      .leftJoinAndSelect('request.major', 'requestMajor')
      .leftJoinAndSelect('request.schoolYear', 'requestSchoolYear')
      .leftJoinAndSelect('request.generalSubjects', 'requestGeneralSubjects')
      .leftJoinAndSelect('request.coreSubjects', 'requestCoreSubjects')
      .leftJoinAndSelect('request.majorRequiredSubjects', 'requestMajorRequiredSubjects')
      .leftJoinAndSelect('request.majorElectiveSubjects', 'requestMajorElectiveSubjects')
      .leftJoinAndSelect('request.internshipOrGraduationSubjects', 'requestInternshipOrGraduationSubjects')
      .leftJoinAndSelect('request.freeElectiveSubjects', 'requestFreeElectiveSubjects')
      .leftJoinAndSelect('program.statusHistory', 'statusHistory')
      .leftJoinAndSelect('statusHistory.user', 'statusHistoryUser');

    query.andWhere('program.isDisplay = :isDisplay', { isDisplay: true });

    if (dto.status) {
      const currentStatus = getProgramStatusFromText(dto.status);
      if (!currentStatus) {
        throw new ForbiddenException('Status is not valid');
      }
      query.andWhere('program.status LIKE :status', { status: currentStatus });
    }

    if (dto.majorId) {
      query.andWhere('requestMajor.id = :majorId', { majorId: `%${dto.majorId}%` });
    }

    if (dto.schoolYearId) {
      query.andWhere('requestSchoolYear.id = :schoolYearId', {
        schoolYearId: `%${dto.schoolYearId}%`,
      });
    }

    if (dto.programName) {
      query.andWhere('request.programName LIKE :programName', {
        programName: `%${dto.programName}%`,
      });
    }

    if (dto.sort) {
      switch (dto.sort) {
        case 'created_at_asc':
          query.orderBy('program.createdAt', 'ASC');
          break;
        case 'created_at_desc':
          query.orderBy('program.createdAt', 'DESC');
          break;
        case 'updated_at_asc':
          query.orderBy('program.updatedAt', 'ASC');
          break;
        case 'updated_at_desc':
          query.orderBy('program.updatedAt', 'DESC');
          break;
        default:
          break;
      }
    }

    const maxCount = await query.getCount();

    if (dto.page && dto.count) {
      query.skip((dto.page - 1) * dto.count).take(dto.count);
    }

    const listProgram = await query.getMany();

    return { value: listProgram, maxValue: maxCount };
  }
}
