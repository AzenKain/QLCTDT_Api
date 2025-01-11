import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interfaces';

export const CurrentUserRefresh = createParamDecorator(
  (data: keyof (JwtPayload & { refreshToken?: string }) | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;  
    return request.user[data]; 
  },
);
