
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-rest') {
    constructor(
        private readonly authService: AuthService,
        private configService: ConfigService,
        ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateJwtPayload(payload);
  
        if (!user) {
          throw new UnauthorizedException(
            'Could not log-in with the provided credentials',
          );
        }
    
        return user;
      }
}