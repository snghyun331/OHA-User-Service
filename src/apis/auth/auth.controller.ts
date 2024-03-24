import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  UseInterceptors,
  Delete,
  Body,
  Put,
} from '@nestjs/common';
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
  ApiResponseErrorConflict,
  ApiResponseCompleteTermSuccess,
} from 'src/utils/decorators';
import { UserDto } from './dto/user.dto';
import { FCMDto } from './dto/fcm.dto';

@ApiTagAuth()
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiDescription('구글 로그인', 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.')
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
    const loginResult = await this.authService.handleSocialLogin(googleUser, transactionManager);

    if (!loginResult.type) {
      return { message: '약관동의를 완료해주세요', result: loginResult };
    }

    const { type, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken, userInfo };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiDescription('카카오 로그인', 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.')
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
    const loginResult = await this.authService.handleSocialLogin(kakaoUser, transactionManager);

    if (!loginResult.type) {
      return { message: '약관동의를 완료해주세요', result: loginResult };
    }

    const { type, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken, userInfo };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiDescription('네이버 로그인', 'New 유저는 약관 동의가 완료되면 로그인 및 가입이 이루어집니다.')
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
    const loginResult = await this.authService.handleSocialLogin(naverUser, transactionManager);

    if (!loginResult.type) {
      return { message: '약관동의를 완료해주세요', result: loginResult };
    }

    const { type, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken, userInfo };
    return { message: '로그인 성공했습니다', result };
  }

  @ApiDescription(
    '약관동의 완료 후 호출할 API - New 유저에 해당',
    '소셜 로그인 api 호출 후 반환되는 유저 정보 객체를 그대로 해당 API의 body에 넣으시면 됩니다',
  )
  @ApiResponseCompleteTermSuccess()
  @ApiResponseErrorConflict('이미 가입된 유저')
  @UseInterceptors(TransactionInterceptor)
  @Post('termsagree')
  async completeTermsAgree(
    @TransactionManager() transactionManager,
    @Body() dto: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { type, isNameExist, accessToken, refreshToken, refreshOption, userInfo } =
      await this.authService.newUserLogin(dto, transactionManager);
    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    const result = { type, isNameExist, accessToken, refreshToken, userInfo };
    return { message: '새로운 유저가 성공적으로 로그인 되었습니다', result };
  }

  @ApiDescription('엑세스 토큰 리프레시(엑세스 토큰이 만료되었을 경우 해당 API로 엑세스 토큰 갱신')
  @ApiBearerAuthRefreshToken()
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

  @ApiDescription('FCM 토큰 전송 API', 'body로 오는 fcm 토큰은 fcm 토큰 생성 시간과 함께 DB에 저장됩니다.')
  @ApiBearerAuthAccessToken()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Put('fcm-token')
  async sendFCM(
    @GetUserId() userId: number,
    @Body() dto: FCMDto,
    @TransactionManager() transactionManager,
  ): Promise<{ message: string }> {
    await this.authService.createFCM(userId, dto, transactionManager);
    return { message: '성공' };
  }
}
