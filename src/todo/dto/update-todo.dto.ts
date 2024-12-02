import { PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: '완료 여부',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: '완료 여부는 boolean 타입이어야 합니다.' })
  isCompleted?: boolean;
} 