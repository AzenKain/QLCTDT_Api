import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserEntity } from 'src/types/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAccessStrategy, JwtRefreshStrategy} from './strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule, UserModule ],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
