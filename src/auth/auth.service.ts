import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/types/user';
import { Repository } from 'typeorm';
import { ChangePasswordDto, LoginDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { JwtPayload } from './interfaces';
import { UserService } from '../user/user.service';
import { getGenderTypeFromText, getPositionTypeFromText } from '../user/enum';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async validateJwtPayload(payload: JwtPayload) {
    return await this.userService.getUserForJwtService(
      payload.email,
      payload.id,
    );
  }

  async LoginService(dto: LoginDto) {
    const cacheUser = await this.userService.getUserByEmailService(dto.email);

    if (!cacheUser.role.personalRule.login) {
      throw new ForbiddenException('Role forbidden');
    }

    const pwMatches = await argon.verify(cacheUser.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException('Wrong password');

    if (cacheUser) {
      delete cacheUser.hash;
      delete cacheUser.refreshToken;
    }
    const token = await this.signToken(cacheUser.secretKey, cacheUser.email);
    await this.updateRefreshToken(cacheUser.secretKey, token.refresh_token);
    return token;
  }

  async ChangePasswordService(dto: ChangePasswordDto, user: UserEntity) {
    if (!user.role.personalRule.changePassword) {
      throw new ForbiddenException('Role forbidden');
    }

    const pwMatches = await argon.verify(user.hash, dto.oldPassword);

    if (!pwMatches) throw new ForbiddenException('Wrong old password');

    user.hash = await argon.hash(dto.newPassword);

    const newUser = await this.userRepository.save(user);

    const token = await this.signToken(newUser.secretKey, newUser.email);
    await this.updateRefreshToken(newUser.secretKey, token.refresh_token);
    return token;
  }

  async RefreshService(dto: JwtPayload) {
    const cacheUser = await this.userService.getUserForJwtService(
      dto.email,
      dto.id,
    );
    if (!cacheUser) throw new ForbiddenException('This user does not exist');

    const token = await this.signToken(cacheUser.secretKey, cacheUser.email);
    await this.updateRefreshToken(cacheUser.secretKey, token.refresh_token);
    return token;
  }

  async SignupService(dto: SignUpDto) {
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

    const checkMail = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (checkMail != null) {
      throw new ForbiddenException('This email was existed before');
    }

    const hash = await argon.hash(dto.password);

    const UserCre = this.userRepository.create({
      secretKey: uuidv5(dto.email, uuidv5.URL),
      email: dto.email,
      hash: hash,
      refreshToken: uuidv4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      userId: dto.userId,
      phoneNumber: dto.phoneNumber || '',
      gender: dto.gender || '',
      position: dto.position
    });

    const newUser = await this.userRepository.save(UserCre);
    const token = await this.signToken(newUser.secretKey, newUser.email);
    await this.updateRefreshToken(newUser.secretKey, token.refresh_token);
    return token;
  }

  async signToken(
    id: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const accessToken = await this.jwt.signAsync(
      {
        id: id,
        email,
      },
      {
        expiresIn: '2h',
        secret: this.config.get('JWT_SECRET'),
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        id: id,
        email,
      },
      {
        expiresIn: '15d',
        secret: this.config.get('JWT_REFRESH_SECRET'),
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.getUserBySecretKeyService(userId);
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }
}
