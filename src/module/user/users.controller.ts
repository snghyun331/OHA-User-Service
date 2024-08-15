import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateMyInfoDto } from './dto/updateMyInfo.dto';
import { UsersInfoDto } from './dto/users-info.dto';
import { UsersService } from './users.service';
import { TransactionInterceptor } from '../../interceptor/transaction.interceptor';
import { JwtAuthGuard } from '../../auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  GetUserId,
  TransactionManager,
  ApiBearerAuthAccessToken,
  ApiBodyImageForm,
  ApiConsumesMultiForm,
  ApiDescription,
  ApiResponseErrorBadRequest,
  ApiResponseErrorConflict,
  ApiResponseErrorNotFound,
  ApiResponseSuccess,
  ApiTagUser,
  ApiResponseProfileUpload,
  ApiParamDescription,
} from 'src/utils/decorators';
import { ApiConsumes } from '@nestjs/swagger';

@ApiTagUser()
@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiDescription('닉네임 및 프로필 업데이트')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuthAccessToken()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor, FileInterceptor('profileImage'))
  @Put('myinfo')
  async updateMyInfo(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() dto: UpdateMyInfoDto,
  ): Promise<{ message: string; result?: any }> {
    const result = await this.userService.updateMyInfo(userId, { ...dto, profileImage }, transactionManager);
    if (result) {
      return { message: '내 정보가 성공적으로 업데이트 되었습니다.', result };
    } else {
      return { message: '내 정보가 성공적으로 업데이트 되었습니다.' };
    }
  }

  @ApiDescription('프로필 사진 삭제')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @ApiResponseErrorNotFound('존재하지 않는 사용자, 프로필이 이미 삭제되었거나 존재하지 않음')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Put('image/profile-delete')
  async deleteProfile(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
  ): Promise<{ message: string }> {
    await this.userService.deleteProfile(userId, transactionManager);
    return { message: '성공적으로 프로필이 삭제되었습니다.' };
  }

  @ApiDescription('현재 사용자 정보 조회')
  @ApiBearerAuthAccessToken()
  @ApiResponseSuccess()
  @ApiResponseErrorNotFound('존재하지 않는 사용자')
  @UseGuards(JwtAuthGuard)
  @Get('myinfo')
  async getMyInfo(@GetUserId() userId: number): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserById(userId);
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

  @ApiDescription('특정 사용자 한명 정보 조회')
  @ApiParamDescription('userId', '숫자로 입력해주세요')
  @ApiBearerAuthAccessToken()
  @UseGuards(JwtAuthGuard)
  @Get('specificuser/:userId')
  async getSpecificUser(@Param('userId') userId: number): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserById(userId);
    return { message: '요청한 유저의 정보를 성공적으로 가져왔습니다', result };
  }
}
