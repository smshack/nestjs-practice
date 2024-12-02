import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: '할일 제목',
    example: '보고서 작성하기',
    minLength: 2,
    maxLength: 100
  })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '제목은 최대 100자까지 가능합니다.' })
  title: string;

  @ApiPropertyOptional({
    description: '할일 설명',
    example: '월간 보고서 작성 및 검토',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '설명은 최대 500자까지 가능합니다.' })
  description?: string;
} 