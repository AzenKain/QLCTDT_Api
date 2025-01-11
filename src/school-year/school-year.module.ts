import { Global, Module } from '@nestjs/common';
import { SchoolYearController } from './school-year.controller';
import { SchoolYearService } from './school-year.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolYearEntity } from '../types/schoolYear';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SchoolYearEntity])],
  controllers: [SchoolYearController],
  providers: [SchoolYearService],
  exports: [SchoolYearService]
})
export class SchoolYearModule {}
