import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './types/user';
import { MediaModule } from './media/media.module';
import { ClassEntity } from './types/class';
import { DepartmentEntity } from './types/department';
import { MajorEntity } from './types/major';
import { ProgramDetailEntity, ProgramEntity, ProgramStatusHistoryEntity } from './types/program';
import {
  AdministrationRuleEntity,
  InformationLookupRuleEntity,
  PersonalRuleEntity,
  RoleEntity,
} from './types/role';
import { SchoolYearEntity } from './types/schoolYear';
import { SubjectEntity } from './types/subject';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './user/user.module';
import { ClassModule } from './class/class.module';
import { SchoolYearModule } from './school-year/school-year.module';
import { RoleModule } from './role/role.module';
import { DepartmentModule } from './department/department.module';
import { MajorModule } from './major/major.module';
import { SubjectModule } from './subject/subject.module';
import { ProgramModule } from './program/program.module';
import { EventModule } from './event/event.module';
import { EventEntity } from './types/event';
import { AppController } from './app.controller.';

@Module({
  imports: [    
    JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
    }),
    inject: [ConfigService],
    global: true,
  }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env']
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: +configService.get<number>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USERNAME'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        entities: [
          UserEntity, 
          ClassEntity,
          DepartmentEntity,
          MajorEntity,
          ProgramEntity,
          ProgramDetailEntity,
          ProgramStatusHistoryEntity,
          RoleEntity,
          PersonalRuleEntity,
          InformationLookupRuleEntity,
          AdministrationRuleEntity,
          SchoolYearEntity,
          SubjectEntity,
          EventEntity

        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          ttl: 30 * 1000,
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: +configService.get<number>('REDIS_PORT'),
          }
        });
        return { store };
      },
      inject: [ConfigService]
    }),
    MediaModule,
    UserModule,
    ClassModule,
    SchoolYearModule,
    RoleModule,
    DepartmentModule,
    MajorModule,
    SubjectModule,
    ProgramModule,
    EventModule,

  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
