import { Body, Controller, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersService } from './users.service';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  GetUserId,
  GetUserProviderId,
  TransactionManager,
  ApiBearerAuthAccessToken,
  ApiBodyImageForm,
  ApiConsumesMultiForm,
  ApiDescription,
  ApiParamDescription,
  ApiResponseErrorBadRequest,
  ApiResponseErrorConflict,
  ApiResponseErrorNotFound,
  ApiResponseSuccess,
  ApiTagUser,
} from 'src/utils/decorators';

@ApiTagUser()
@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiDescription('닉네임 업데이트')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @ApiResponseErrorBadRequest('엑세스 토큰 없음')
  @ApiResponseErrorConflict('이미 닉네임이 존재')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Put('updatename')
  async updateName(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @Body() updateNameDto: UpdateNameDto,
  ): Promise<{ message: string }> {
    await this.userService.updateNickname(userId, updateNameDto, transactionManager);
    return { message: '닉네임이 성공적으로 업데이트 되었습니다.' };
  }

  @ApiDescription('프로필 시잔 업데이트')
  @ApiBearerAuthAccessToken()
  @ApiConsumesMultiForm()
  @ApiBodyImageForm('profileImage')
  @ApiResponseSuccess()
  @ApiResponseErrorBadRequest('사용자는 존재하나 업데이트 영향을 받은 필드가 없음(업데이트 X)')
  @ApiResponseErrorNotFound('존재하지 않는 사용자')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor, FileInterceptor('profileImage'))
  @Put('updateimage/profile')
  async updateProfile(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.uploadProfile(userId, file.filename, transactionManager);
    return { message: '성공적으로 프로필이 업데이트 되었습니다', result };
  }

  @ApiDescription('배경 시잔 업데이트')
  @ApiBearerAuthAccessToken()
  @ApiConsumesMultiForm()
  @ApiBodyImageForm('backgroundImage')
  @ApiResponseSuccess()
  @ApiResponseErrorBadRequest('사용자는 존재하나 업데이트 영향을 받은 필드가 없음(업데이트 X)')
  @ApiResponseErrorNotFound('존재하지 않는 사용자')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor, FileInterceptor('backgroundImage'))
  @Put('updateimage/background')
  async updateBGImage(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.uploadBGImage(userId, file.filename, transactionManager);
    return { message: '성공적으로 배경 이미지가 업데이트 되었습니다', result };
  }

  @ApiDescription('이미지 확인하기')
  @ApiBearerAuthAccessToken()
  @ApiParamDescription('filename', '(예) 170605242.png')
  @UseGuards(JwtAuthGuard)
  @Get('uploads/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response): Promise<{ message: string }> {
    res.sendFile(filename, { root: 'uploads' });
    return { message: '이미지를 성공적으로 가져왔습니다' };
  }

  @ApiDescription('현재 사용자 정보 조히')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @ApiResponseErrorNotFound('존재하지 않는 사용자')
  @UseGuards(JwtAuthGuard)
  @Get('getmyinfo')
  async getMyInfo(
    @GetUserId() userId: number,
    @GetUserProviderId() providerId: string,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserInfo(userId, providerId);
    return { message: '내 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiDescription('모든 사용자 정보 조히')
  @ApiResponseSuccess()
  @Get('getallusers')
  async getAllUsers(): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUsersInfo();
    return { message: '모든 사용자 정보를 성공적으로 가져왔습니다', result };
  }
}
