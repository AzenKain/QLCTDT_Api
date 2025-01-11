import { Global, Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../types/class';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity])],
  providers: [ClassService],
  controllers: [ClassController],
  exports: [ClassService]
})
export class ClassModule {}
