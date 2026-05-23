import { IsString, IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '사용자 로그인 ID', example: 'newuser123' })
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디는 필수 입력 항목입니다.' })
  @Length(4, 20, { message: '아이디는 4자 이상 20자 이하로 입력해주세요.' })
  username: string;

  @ApiProperty({ description: '비밀번호 (평문)', example: 'password1234' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Length(6, 30, { message: '비밀번호는 6자 이상 30자 이하로 입력해주세요.' })
  password: string;

  // 💡 회원가입 시 권한을 직접 지정하지 않으면 엔티티의 default인 'USER'가 적용되도록 선택적(Optional) 처리합니다.
  @ApiProperty({ description: '사용자 권한 (ADMIN / USER)', default: 'USER', example: 'USER', required: false })
  @IsEnum(['ADMIN', 'USER'], { message: '권한은 ADMIN 또는 USER만 가능합니다.' })
  @IsOptional()
  role?: string;
}