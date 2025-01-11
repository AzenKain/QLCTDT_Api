import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramDetailEntity, ProgramEntity, ProgramStatusHistoryEntity } from '../types/program';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramEntity, ProgramDetailEntity, ProgramStatusHistoryEntity])],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService]
})
export class ProgramModule {}
