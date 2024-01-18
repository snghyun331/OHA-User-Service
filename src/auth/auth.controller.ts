import { Controller, Get, Post, HttpCode, HttpStatus, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GetUser, GetUserProviderId, GetUserId } from 'src/utils/decorators/get-user.decorator';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/utils/decorators/transaction.decorator';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';
import { GoogleUser, KakaoUser, NaverUser } from './interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '구글 로그인' })
  @ApiCreatedResponse({
    description: 'type: new -> 새로운 회원, exist -> 기존 회원',
    schema: {
      example: {
        statusCode: 200,
        message: '로그인 성공했습니다',
        data: {
          type: 'exist',
          isNameExist: 'false',
          accessToken: 'e~',
          refreshToken: 'e~',
        },
      },
    },
  })
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin(): Promise<void> {}

  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Get('google/callback')
  async googleCallback(
    @TransactionManager() transactionManager,
    @GetUser() googleUser: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.handleSocialLogin(googleUser, transactionManager);

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation({ summary: '카카오 로그인' })
  @ApiCreatedResponse({
    description: 'type: new -> 새로운 회원, exist -> 기존 회원',
    schema: {
      example: {
        statusCode: 200,
        message: '로그인 성공했습니다',
        data: {
          type: 'exist',
          accessToken: 'e~',
          refreshToken: 'e~',
        },
      },
    },
  })
  @UseGuards(KakaoAuthGuard)
  @Get('kakao/login')
  async kakaoLogin(): Promise<void> {}

  @ApiExcludeEndpoint()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(KakaoAuthGuard)
  @Get('kakao/callback')
  async kakaoCallback(
    @TransactionManager() transactionManager,
    @GetUser() kakaoUser: KakaoUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.handleSocialLogin(kakaoUser, transactionManager);
    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation({ summary: '네이버 로그인' })
  @ApiCreatedResponse({
    description: 'type: new -> 새로운 회원, exist -> 기존 회원',
    schema: {
      example: {
        statusCode: 200,
        message: '로그인 성공했습니다',
        data: {
          type: 'exist',
          accessToken: 'e~',
          refreshToken: 'e~',
        },
      },
    },
  })
  @UseGuards(NaverAuthGuard)
  @Get('naver/login')
  async naverLogin(): Promise<void> {}

  @ApiExcludeEndpoint()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(NaverAuthGuard)
  @Get('naver/callback')
  async naverCallback(
    @TransactionManager() transactionManager,
    @GetUser() naverUser: NaverUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.handleSocialLogin(naverUser, transactionManager);
    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiBearerAuth('refresh-token')
  @ApiOperation({ summary: '엑세스 토큰 리프레시(엑세스 토큰이 만료되었을 경우 해당 API로 엑세스 토큰 갱신' })
  @ApiResponse({ status: 200, description: '엑세스 토큰 갱신 성공' })
  @ApiResponse({ status: 400, description: 'Refresh Token이 없거나 형식에 어긋날 때' })
  @ApiResponse({ status: 401, description: 'Refresh Token 만료' })
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshAccessToken(
    @GetUserId() userId: number,
    @GetUserProviderId() googleId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { accessToken, ...accessOption } = await this.authService.getCookieWithAccessToken(userId, googleId);
    res.header('Authorization', `Bearer ${accessToken}`);
    const result = { accessToken };
    return { message: '성공적으로 access 토큰이 갱신되었습니다', result };
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @TransactionManager() transactionManager,
    @GetUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const { accessOption, refreshOption } = await this.authService.socialLogout(userId, transactionManager);
    res.cookie('Access-Token', '', accessOption);
    res.cookie('Refresh-Token', '', refreshOption);
    return { message: '성공적으로 로그아웃 되었습니다.' };
  }
}
