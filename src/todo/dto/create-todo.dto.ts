import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: '장보기', description: '할일 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '우유, 계란 사기', description: '할일 내용', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, description: '완료 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
} 