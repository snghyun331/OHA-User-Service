import { Body, Controller, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersService } from './users.service';
import { TransactionManager } from 'src/utils/decorators/transaction.decorator';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUserId, GetUserProviderId } from 'src/utils/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('USER')
@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @ApiOperation({ summary: '닉네임 업데이트' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: '엑세스 토큰 없음' })
  @ApiResponse({ status: 409, description: '이미 닉네임이 존재' })
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

  @ApiOperation({ summary: '프로필 사진 업데이트' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload Profile picture',
    schema: {
      type: 'object',
      properties: {
        profileUrl: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: '사용자는 존재하나 업데이트 영향을 받은 필드가 없음(업데이트 X)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor, FileInterceptor('profileUrl'))
  @Put('updateimage/profile')
  async updateProfile(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.uploadProfile(userId, file.filename, transactionManager);
    return { message: '성공적으로 프로필이 업데이트 되었습니다', result };
  }

  @ApiOperation({ summary: '배경 사진 업데이트' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload Background picture',
    schema: {
      type: 'object',
      properties: {
        backgroundUrl: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: '사용자는 존재하나 업데이트 영향을 받은 필드가 없음(업데이트 X)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor, FileInterceptor('backgroundUrl'))
  @Put('updateimage/background')
  async updateBGImage(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.uploadBGImage(userId, file.filename, transactionManager);
    return { message: '성공적으로 배경 이미지가 업데이트 되었습니다', result };
  }

  @ApiOperation({ summary: '이미지 확인하기(가져오기)' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'filename', description: '(예) 170605242.png' })
  @UseGuards(JwtAuthGuard)
  @Get('uploads/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response): Promise<{ message: string }> {
    res.sendFile(filename, { root: 'uploads' });
    return { message: '이미지를 성공적으로 가져왔습니다' };
  }

  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'OK ' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async readMyInfo(
    @GetUserId() userId: number,
    @GetUserProviderId() providerId: string,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.getUserInfo(userId, providerId);
    return { message: '내 정보를 성공적으로 가져왔습니다', result };
  }
}
