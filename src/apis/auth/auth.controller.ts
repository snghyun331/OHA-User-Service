import { Controller, Get, Post, HttpCode, HttpStatus, Res, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { GoogleUser, KakaoUser, NaverUser } from './interfaces';
import { JwtAuthGuard, JwtRefreshAuthGuard, GoogleAuthGuard, KakaoAuthGuard, NaverAuthGuard } from 'src/guards';
import {
  GetUser,
  GetUserId,
  GetUserProviderId,
  TransactionManager,
  ApiTagAuth,
  ApiDescription,
  ApiResponseLoginSuccess,
  ApiExclude,
  ApiBearerAuthRefreshToken,
  ApiResponseSuccess,
  ApiResponseErrorBadRequest,
  ApiResponseErrorUnauthorized,
  ApiBearerAuthAccessToken,
} from 'src/utils/decorators';

@ApiTagAuth()
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiDescription('구글 로그인')
  @ApiResponseLoginSuccess()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin(): Promise<void> {}

  @ApiExclude()
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Get('google/callback')
  async googleCallback(
    @TransactionManager() transactionManager,
    @GetUser() googleUser: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, refreshToken, refreshOption } = await this.authService.handleSocialLogin(
      googleUser,
      transactionManager,
    );

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiDescription('카카오 로그인')
  @ApiResponseLoginSuccess()
  @UseGuards(KakaoAuthGuard)
  @Get('kakao/login')
  async kakaoLogin(): Promise<void> {}

  @ApiExclude()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(KakaoAuthGuard)
  @Get('kakao/callback')
  async kakaoCallback(
    @TransactionManager() transactionManager,
    @GetUser() kakaoUser: KakaoUser,

    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, refreshToken, refreshOption } = await this.authService.handleSocialLogin(
      kakaoUser,
      transactionManager,
    );
    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiDescription('네이버 로그인')
  @ApiResponseLoginSuccess()
  @UseGuards(NaverAuthGuard)
  @Get('naver/login')
  async naverLogin(): Promise<void> {}

  @ApiExclude()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(NaverAuthGuard)
  @Get('naver/callback')
  async naverCallback(
    @TransactionManager() transactionManager,
    @GetUser() naverUser: NaverUser,

    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, refreshToken, refreshOption } = await this.authService.handleSocialLogin(
      naverUser,
      transactionManager,
    );
    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiBearerAuthRefreshToken()
  @ApiDescription('엑세스 토큰 리프레시(엑세스 토큰이 만료되었을 경우 해당 API로 엑세스 토큰 갱신')
  @ApiResponseSuccess()
  @ApiResponseErrorBadRequest('Refresh Token이 없거나 형식에 어긋날 때')
  @ApiResponseErrorUnauthorized('Refresh Token 만료')
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshAccessToken(
    @GetUserId() userId: number,
    @GetUserProviderId() googleId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { accessToken } = await this.authService.getCookieWithAccessToken(userId, googleId);
    res.header('Authorization', `Bearer ${accessToken}`);
    const result = { accessToken };
    return { message: '성공적으로 access 토큰이 갱신되었습니다', result };
  }

  @ApiDescription('로그아웃')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @TransactionManager() transactionManager,
    @GetUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { refreshOption } = await this.authService.socialLogout(userId, transactionManager);
    res.cookie('Refresh-Token', '', refreshOption);
    return { message: '성공적으로 로그아웃 되었습니다.' };
  }

  @ApiDescription('회원탈퇴')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Delete('withdraw')
  async userWithdraw(
    @TransactionManager() transactionManager,
    @GetUserId() userId: number,
    @GetUserProviderId() providerId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { refreshOption } = await this.authService.deleteUserAndLogout(userId, providerId, transactionManager);
    res.cookie('Refresh-Token', '', refreshOption);
    return { message: '성공적으로 탈퇴되었습니다' };
  }
}
