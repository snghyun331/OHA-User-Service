import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('refresh') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh Token is expired. Please re-login');
      }
      if (err instanceof JsonWebTokenError) {
        throw new BadRequestException(err.message);
      }
      if (err instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON object');
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
