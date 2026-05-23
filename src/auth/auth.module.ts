import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 1. Passport 미들웨어 생태계를 NestJS에 이식하기 위한 기본 모듈
    PassportModule,
    // 2. JWT 서명/검증 모듈 선언
    // service 내부(signAsync)에서 secret과 만료시간을 dynamic하게 제어하므로 설정은 비워둡니다.
    JwtModule.register({}),
  ],
  controllers: [
    // 외부 HTTP 요청(Login, Refresh 등)의 라우팅 진입점
    AuthController,
  ],
  providers: [
    // 비즈니스 핵심 로직 (토큰 발급 및 검증 로직 수립)
    AuthService,
    // API 요청 시 인가 가드(JwtAuthGuard)가 토큰을 해석할 때 활용할 Passport 전략
    JwtStrategy,
  ],
  exports: [
    // 다른 모듈(예: UserModule 등)에서 인증 상태 확인 및 가드를 재사용할 수 있도록 서비스 내보내기
    AuthService,
  ],
})
export class AuthModule {}