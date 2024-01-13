import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GetUser, GetUserGoogleId, GetUserId } from 'src/utils/decorators/get-user.decorator';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '구글 로그인 API' })
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin(): Promise<void> {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @GetUser() user,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.googleRegisterOrLogin(user);

    res.cookie('Access-Token', accessToken, accessOption);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshAccessToken(
    @GetUserId() userId,
    @GetUserGoogleId() googleId,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { accessToken, ...accessOption } = await this.authService.getCookieWithAccessToken(userId, googleId);
    res.cookie('Access-Token', accessToken, accessOption);
    const result = { accessToken };
    return { message: '성공적으로 access 토큰이 갱신되었습니다', result };
  }
}
