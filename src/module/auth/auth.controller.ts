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
import { TransactionInterceptor } from '../../interceptor/transaction.interceptor';
import { GoogleUser, KakaoUser, NaverUser, AppleUser } from './interface';
import {
  JwtAuthGuard,
  JwtRefreshAuthGuard,
  GoogleAuthGuard,
  KakaoAuthGuard,
  NaverAuthGuard,
  AppleAuthGuard,
} from '../../auth/guard';
import { GetUser, GetUserId, GetUserProviderId, TransactionManager } from '../../utils/decorators';
import { FCMDto } from './dto/fcm.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AUTH_APPLE_LOGIN,
  AUTH_GOOGLE_LOGIN,
  AUTH_KAKAO_LOGIN,
  AUTH_LOGOUT,
  AUTH_NAVER_LOGIN,
  AUTH_REFRESH,
  AUTH_SEND_FCM,
  AUTH_TERMS_AGREE,
  AUTH_WITHDRAW,
} from './swagger/auth.swagger';

@ApiTags('AUTH')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation(AUTH_GOOGLE_LOGIN.GET.API_OPERATION)
  @ApiOkResponse(AUTH_GOOGLE_LOGIN.GET.API_OK_RESPONSE)
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
    const loginResult = await this.authService.handleSocialLogin(googleUser, transactionManager);
    const { isJoined, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;
    const result = { isJoined, isNameExist, accessToken, refreshToken, userInfo };

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    if (isJoined === false) {
      return { message: '약관동의를 완료해주세요.', result };
    }

    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation(AUTH_KAKAO_LOGIN.GET.API_OPERATION)
  @ApiOkResponse(AUTH_KAKAO_LOGIN.GET.API_OK_RESPONSE)
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
    const loginResult = await this.authService.handleSocialLogin(kakaoUser, transactionManager);

    const { isJoined, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;
    const result = { isJoined, isNameExist, accessToken, refreshToken, userInfo };

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    if (isJoined === false) {
      return { message: '약관동의를 완료해주세요.', result };
    }

    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation(AUTH_NAVER_LOGIN.GET.API_OPERATION)
  @ApiOkResponse(AUTH_NAVER_LOGIN.GET.API_OK_RESPONSE)
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
    const loginResult = await this.authService.handleSocialLogin(naverUser, transactionManager);

    const { isJoined, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;
    const result = { isJoined, isNameExist, accessToken, refreshToken, userInfo };

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    if (isJoined === false) {
      return { message: '약관동의를 완료해주세요.', result };
    }

    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation(AUTH_APPLE_LOGIN.GET.API_OPERATION)
  @ApiOkResponse(AUTH_APPLE_LOGIN.GET.API_OK_RESPONSE)
  @UseGuards(AppleAuthGuard)
  @Get('apple/login')
  async appleLogin(): Promise<void> {}

  @ApiExcludeEndpoint()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AppleAuthGuard)
  @Post('apple/callback')
  async appleCallback(
    @TransactionManager() transactionManager,
    @Body() payload,
    @GetUser() appleUser: AppleUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const loginResult = await this.authService.handleSocialLogin(appleUser, transactionManager);

    const { isJoined, isNameExist, accessToken, refreshToken, refreshOption, userInfo } = loginResult;
    const result = { isJoined, isNameExist, accessToken, refreshToken, userInfo };

    res.header('Authorization', `Bearer ${accessToken}`);
    res.cookie('Refresh-Token', refreshToken, refreshOption);

    if (isJoined === false) {
      return { message: '약관동의를 완료해주세요.', result };
    }

    return { message: '로그인 성공했습니다', result };
  }

  @ApiOperation(AUTH_TERMS_AGREE.PUT.API_OPERATION)
  @ApiOkResponse(AUTH_TERMS_AGREE.PUT.API_OK_RESPONSE)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Put('termsagree')
  async completeTermsAgree(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
  ): Promise<{ message: string }> {
    await this.authService.updateJoinStatus(userId, transactionManager);
    return { message: '해당 유저에 대한 약관동의가 완료되었습니다.' };
  }

  @ApiOperation(AUTH_REFRESH.GET.API_OPERATION)
  @ApiOkResponse(AUTH_REFRESH.GET.API_OK_RESPONSE)
  @ApiBadRequestResponse(AUTH_REFRESH.GET.API_BAD_REQUEST_RESPONSE)
  @ApiUnauthorizedResponse(AUTH_REFRESH.GET.API_UNAUTHORIZED_RESPONSE)
  @ApiBearerAuth('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshAccessToken(
    @GetUser() user,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; result: any }> {
    const { userId, providerId, userGrade } = user;
    const { accessToken } = await this.authService.getCookieWithAccessToken(userId, providerId, userGrade);
    res.header('Authorization', `Bearer ${accessToken}`);
    const result = { accessToken };
    return { message: '성공적으로 access 토큰이 갱신되었습니다', result };
  }

  @ApiOperation(AUTH_LOGOUT.POST.API_OPERATION)
  @ApiOkResponse(AUTH_LOGOUT.POST.API_OK_RESPONSE)
  @ApiBearerAuth('access-token')
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

  @ApiOperation(AUTH_WITHDRAW.DELETE.API_OPERATION)
  @ApiOkResponse(AUTH_WITHDRAW.DELETE.API_OK_RESPONSE)
  @ApiBearerAuth('access-token')
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

  @ApiOperation(AUTH_SEND_FCM.PUT.API_OPERATION)
  @ApiBearerAuth('access-token')
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
