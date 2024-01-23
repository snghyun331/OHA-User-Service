import { Body, Controller, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersService } from './users.service';
import { TransactionManager } from 'src/utils/decorators/transaction.decorator';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUserId } from 'src/utils/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';

@ApiTags('USER')
@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: '닉네임 업데이트' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: '성공적으로 업데이트' })
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    TransactionInterceptor,
    FileInterceptor('profileUrl', {
      storage: diskStorage({
        destination(req, file, callback) {
          callback(null, './uploads');
        },
        filename(req, file, callback) {
          const uniqueSuffix = `${Date.now()}`;
          const extension = file.originalname.split('.').pop();
          callback(null, `${uniqueSuffix}.${extension}`);
        },
      }),
      fileFilter(req, file, callback) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error('Invalid file type');
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  @Put('updateimage/profile')
  async updateProfile(
    @GetUserId() userId: number,
    @TransactionManager() transactionManager,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; result: any }> {
    const result = await this.userService.uploadProfile(userId, file.filename);
    return { message: '성공적으로 프로필이 업데이트 되었습니다', result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('uploads/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response): Promise<{ message: string }> {
    res.sendFile(filename, { root: 'uploads' });
    return { message: '이미지를 성공적으로 가져왔습니다' };
  }

  // @ApiOperation({ summary: '배경 사진 업데이트' })
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(TransactionInterceptor)
  // @Put('updateimage/background')
  // async updateBGImage(
  //   @GetUserId() userId: number,
  //   @TransactionManager() transactionManager,
  // ): Promise<{ message: string; result: any }> {
  //   return { message: '성공적으로 배경 사진이 업데이트 되었습니다', result };
  // }
}
