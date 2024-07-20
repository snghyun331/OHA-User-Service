import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMyInfoDto {
  @ApiProperty({
    description: '최소 2자 최대 8자, 공백X', required: false
  })
  @IsOptional()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(8, { message: '닉네임은 최대 8자 이하이어야 합니다.' })
  @Matches(/^\S+$/, { message: '닉네임에는 공백이 포함될 수 없습니다.' })
  @Matches(/^[\p{L}\p{N}_\.]+$/u, { message: '닉네임은 문자, 숫자, 밑줄, 마침표만 가능합니다' })
  readonly name?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '업로드할 프로필 사진', required: false })
  readonly profileImage: any;
}
