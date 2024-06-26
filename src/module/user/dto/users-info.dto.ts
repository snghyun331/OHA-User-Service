import { ApiProperty } from '@nestjs/swagger';

export class UsersInfoDto {
  @ApiProperty({ example: [1, 2, 3] })
  userIds: number[];
}
