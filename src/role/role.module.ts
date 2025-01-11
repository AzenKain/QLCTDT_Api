import { Global, Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdministrationRuleEntity,
  InformationLookupRuleEntity,
  PersonalRuleEntity,
  RoleEntity,
} from '../types/role';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, PersonalRuleEntity, AdministrationRuleEntity, InformationLookupRuleEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
