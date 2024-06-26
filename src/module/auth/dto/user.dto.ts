import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  provider: string;

  @ApiProperty()
  providerId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}
