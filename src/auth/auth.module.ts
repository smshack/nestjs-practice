import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy'; // 💡 [필수 임포트] 리프레시 전략을 가져옵니다.
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [
    // Passport 미들웨어 생태계를 NestJS에 이식하기 위한 기본 모듈
    PassportModule,
    
    // JWT 서명/검증 모듈 선언
    JwtModule.register({}),
    
    // UserModule이 exports하고 있는 'UserService'를 AuthService가 가져다 쓸 수 있게 됩니다.
    UserModule,
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
    // 🔑 [여기가 누락됐었습니다!] 가드가 'jwt-refresh' 전략을 찾을 수 있도록 인스턴스를 주입합니다.
    RefreshStrategy,
  ],
  exports: [
    // 다른 모듈에서 인증 상태 확인 및 가드를 재사용할 수 있도록 서비스 내보내기
    AuthService,
  ],
})
export class AuthModule {}