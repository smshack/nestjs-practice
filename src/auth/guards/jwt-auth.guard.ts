import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// =========================================================================
// 🔒 1. 엑세스 토큰 전용 가드 (JwtAuthGuard)
// 일반 API 엔드포인트(예: /auth/me, /users 등)를 보호할 때 사용합니다.
// =========================================================================
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  canActivate(context: ExecutionContext) {
    // 부모 클래스(AuthGuard)의 기본 Passport 인증 로직을 실행합니다.
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 토큰이 없거나, 만료되었거나, 위변조되어 검증에 실패한 경우
    if (err || !user) {
      throw err || new UnauthorizedException('인증 자격 증명이 유효하지 않거나 토큰이 누락되었습니다.');
    }
    
    // 검증에 성공하면 유저 객체를 리턴하여 request.user에 안착시킵니다.
    return user;
  }
}

// =========================================================================
// 🔄 2. 리프레시 토큰 전용 가드 (JwtRefreshGuard)
// 토큰 재발급 엔드포인트(POST /auth/refresh)만을 철저히 보호할 때 사용합니다.
// =========================================================================
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  
  canActivate(context: ExecutionContext) {
    // 부모 클래스를 통해 'jwt-refresh' 전략(RefreshStrategy)을 작동시킵니다.
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 쿠키에 리프레시 토큰이 없거나, 만료되었거나, DB 2차 대조에서 실패한 경우
    if (err || !user) {
      throw err || new UnauthorizedException('리프레시 토큰이 유효하지 않거나 만료되었습니다. 다시 로그인해 주세요.');
    }
    
    // 검증에 성공하면 유저 및 원본 토큰 정보 객체를 리턴하여 request.user에 안착시킵니다.
    return user;
  }
}