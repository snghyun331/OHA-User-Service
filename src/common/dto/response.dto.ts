import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ResponseDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;
}
