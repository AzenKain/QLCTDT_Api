import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuardRestApi, JwtGuardRestApiRefresh } from './guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, SignUpDto } from './dto';
import { CurrentUserAccess, CurrentUserRefresh } from 'src/decorators';
import { JwtPayload } from './interfaces';
import { UserEntity } from '../types/user';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ){}

    @Post('login')
    async LoginController(
        @Body() dto : LoginDto,
    ) {
        return await this.authService.LoginService(dto)
    }

    @UseGuards(JwtGuardRestApi)
    @Post('change-password')
    async ChangePasswordController(
      @Body() dto : ChangePasswordDto,
      @CurrentUserAccess() user: UserEntity
    ) {
        return await this.authService.ChangePasswordService(dto, user)
    }

    @Post('signup')
    async SignUpController(
        @Body() dto : SignUpDto,
    ) {
        return await this.authService.SignupService(dto)
    }
    
    @UseGuards(JwtGuardRestApiRefresh)
    @Post('refresh')
    async RefreshController(
        @CurrentUserRefresh() user: JwtPayload
    ) {
        return await this.authService.RefreshService(user)
    }
}
