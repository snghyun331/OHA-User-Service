import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersInfoDto } from './dto/users-info.dto';
import { UsersService } from './users.service';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { JwtAuthGuard } from 'src/guards';
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
  GetUserToken,
} from 'src/utils/decorators';
import { FreqDistrictDto } from './dto/freq-disctrict.dto';

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
  @Put('name')
  async updateName(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @Body() dto: UpdateNameDto,
  ): Promise<{ message: string }> {
    await this.userService.updateNickname(userId, dto, transactionManager);
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
  @Put('image/profile')
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
  @Put('image/background')
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
  @Get('myinfo')
  async getMyInfo(
    @GetUserId() userId: number,
    @GetUserProviderId() providerId: string,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUser(userId, providerId);
    return { message: '내 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiDescription('모든 사용자 정보 조히')
  @ApiResponseSuccess()
  @ApiBearerAuthAccessToken()
  @UseGuards(JwtAuthGuard)
  @Get('allusers')
  async getAllUsers(): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUsers();
    return { message: '모든 사용자 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiDescription('특정 사용자 여러명 정보 조회')
  @ApiBearerAuthAccessToken()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post('specificusers')
  async getSpecificUsers(
    @Body() dto: UsersInfoDto,
    @TransactionManager() transactionManager,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.getSpecificUsers(dto, transactionManager);
    return { message: '요청한 유저들의 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiDescription('자주 가는 지역 추가')
  @ApiBearerAuthAccessToken()
  @ApiResponseErrorConflict('해당 지역을 이미 선택')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post('freqdistrict')
  async createFreqDistrict(
    @TransactionManager() transactionManager,
    @GetUserToken() token: string,
    @GetUserId() userId: number,
    @Body() dto: FreqDistrictDto,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.createFreqDistrict(token, userId, dto, transactionManager);
    return { message: '자주 가는 지역 리스트에 성공적으로 추가하였습니다', result };
  }

  @ApiDescription('자주 가는 지역 모두 조회')
  @ApiBearerAuthAccessToken()
  @ApiResponseErrorNotFound('코드 조회 결과가 없음')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get('freqdistrict')
  async getFreqDistricts(
    @GetUserToken() token: string,
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.getFreqDistricts(token, userId, transactionManager);
    return { message: '자주 가는 지역 정보를 성공적으로 불러왔습니다', result };
  }

  @ApiDescription('자주 가는 지역 삭제')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @ApiResponseErrorConflict('이미 지역 삭제')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Delete('freqdistrict')
  async deleteFreqDistrict(
    @GetUserToken() token: string,
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @Body() dto: FreqDistrictDto,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.deleteFreqDistrict(token, userId, dto, transactionManager);
    return { message: '성공적으로 지역이 삭제되었습니다', result };
  }
}
