import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateMyInfoDto } from './dto/updateMyInfo.dto';
import { UsersInfoDto } from './dto/users-info.dto';
import { UsersService } from './users.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { JwtAuthGuard } from '../../auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUserId, TransactionManager } from 'src/common/decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  USER_ALL_USERS,
  USER_MY_INFO,
  USER_ONE_USER,
  USER_PROFILE_DELETE,
  USER_SPECIFIC_USERS,
} from './swagger/user.swagger';

@ApiTags('USER')
@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation(USER_MY_INFO.PUT.API_OPERATION)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
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

  @ApiOperation(USER_PROFILE_DELETE.PUT.API_OPERATION)
  @ApiOkResponse(USER_PROFILE_DELETE.PUT.API_OK_RESPONSE)
  @ApiNotFoundResponse(USER_PROFILE_DELETE.PUT.API_NOT_FOUND_RESPONSE)
  @ApiBearerAuth('access-token')
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

  @ApiOperation(USER_MY_INFO.GET.API_OPERATION)
  @ApiOkResponse(USER_MY_INFO.GET.API_OK_RESPONSE)
  @ApiNotFoundResponse(USER_MY_INFO.GET.API_NOT_FOUND_RESPONSE)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('myinfo')
  async getMyInfo(@GetUserId() userId: number): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserById(userId);
    return { message: '내 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiOperation(USER_ALL_USERS.GET.API_OPERATION)
  @ApiOkResponse(USER_ALL_USERS.GET.API_OK_RESPONSE)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('allusers')
  async getAllUsers(): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUsers();
    return { message: '모든 사용자 정보를 성공적으로 가져왔습니다', result };
  }

  @ApiOperation(USER_SPECIFIC_USERS.GET.API_OPERATION)
  @ApiBearerAuth('access-token')
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

  @ApiOperation(USER_ONE_USER.GET.API_OPERATION)
  @ApiParam(USER_ONE_USER.GET.API_PARAM1)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('specificuser/:userId')
  async getSpecificUser(@Param('userId') userId: number): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserById(userId);
    return { message: '요청한 유저의 정보를 성공적으로 가져왔습니다', result };
  }
}
