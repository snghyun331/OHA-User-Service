import { Controller, Get, Inject, Logger, LoggerService, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: '구글 로그인 API' })
  @UseGuards(AuthGuard('google'))
  @Get('google/login')
  async googleLogin(): Promise<void> {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.googleRegisterOrLogin(req.user);

    res.cookie('Access', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);

    const result = { type, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }
}
