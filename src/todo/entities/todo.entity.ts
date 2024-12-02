import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Todo {
  @ApiProperty({ example: 1, description: '할일 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '장보기', description: '할일 제목' })
  @Column()
  title: string;

  @ApiProperty({ example: '우유, 계란 사기', description: '할일 내용' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: false, description: '완료 여부' })
  @Column({ default: false })
  isCompleted: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
} 