import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * [POST /auth/login]
   * 유저의 ID/PW를 검증하여 최초로 JWT(Access/Refresh Token) 쌍을 발급합니다.
   * 프론트엔드 로그인 폼 제출 시 이 엔드포인트로 요청이 들어옵니다.
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // 요청 바디(Body) 전체를 DTO 클래스로 바인딩하여 서비스 계층으로 토스합니다.
    return this.authService.login(dto);
  }

  /**
   * [POST /auth/refresh]
   * 만료된 Access Token을 갱신하기 위해, 프론트엔드 스토리지에 저장되어 있던 
   * Refresh Token을 전달받아 새로운 Access Token을 발급합니다.
   */
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    // 바디 데이터 중 'refreshToken' 키의 문자열 값만 타겟팅하여 파싱 후 전달합니다.
    return this.authService.refresh(refreshToken);
  }
}