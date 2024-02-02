import { ApiProperty } from '@nestjs/swagger';

export class CreateFreqDto {
  @ApiProperty({ description: '(예) 경기도 고양시 덕양구 화정동' })
  readonly address: string;
}
