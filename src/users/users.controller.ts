import { Controller, Get, Inject, Logger, LoggerService, Request, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('api')
export class UsersController {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('google'))
  @Get('/auth/google/login')
  async googleLogin(): Promise<void> {}

  @UseGuards(AuthGuard('google'))
  @Get('/auth/google/callback')
  async googleCallback(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, accessToken, accessOption, refreshToken, refreshOption } =
      await this.usersService.googleRegisterOrLogin(req.user);

    res.cookie('Access', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);

    const result = { type, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }
}
