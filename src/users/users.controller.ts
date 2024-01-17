import { Body, Controller, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersService } from './users.service';
import { TransactionManager } from 'src/utils/decorators/transaction.decorator';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUserId } from 'src/utils/decorators/get-user.decorator';

@ApiTags('USER')
@Controller('api/users')
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
}
