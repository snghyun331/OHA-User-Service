import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('access') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Access Token is expired');
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
