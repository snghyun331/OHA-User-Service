import { ApiProperty } from '@nestjs/swagger';

export class FCMDto {
  @ApiProperty()
  fcmToken: string;
}
