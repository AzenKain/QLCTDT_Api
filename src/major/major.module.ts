import { Global, Module } from '@nestjs/common';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorEntity } from '../types/major';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([MajorEntity])],
  controllers: [MajorController],
  providers: [MajorService],
  exports: [MajorService]
})
export class MajorModule {}
