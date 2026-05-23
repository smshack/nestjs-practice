import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: '사용자 고유 고유 ID (PK)', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '사용자 로그인 ID (고유값)', example: 'admin' })
  @Column({ unique: true })
  username: string;

  // 💡 보안상 패스워드는 Swagger 응답 예시 등에서 제외하거나 description만 노출하는 것이 좋습니다.
  @ApiProperty({ description: 'Bcrypt로 암호화된 비밀번호', example: '$2b$10$...' })
  @Column()
  password: string;

  @ApiProperty({ description: '사용자 권한 (ADMIN / USER)', default: 'USER', example: 'USER' })
  @Column({ default: 'USER' })
  role: string;

  @ApiProperty({ description: 'JWT 토큰 재발급을 위한 암호화된 Refresh Token', required: false, nullable: true })
  @Column({ nullable: true })
  refreshToken: string;
}