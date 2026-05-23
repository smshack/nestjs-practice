import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// 토큰 복호화 후 데이터의 구조(타입)를 명시적으로 정의합니다.
interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. 요청 헤더의 'Authorization: Bearer <토큰>' 패턴에서 JWT를 자동으로 추출하도록 세팅
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. 토큰이 만료되었을 경우 Passport 자체적으로 요청을 즉시 차단(401 Unauthorized)하도록 설정
      ignoreExpiration: false,

      // 3. 토큰의 위변조 여부를 확인할 비밀키 매핑
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  /**
   * [JWT 서명/만료 검증 성공 시 자동 실행]
   * 위 super() 옵션에 의해 토큰 검증이 "통과"되면 복호화된 페이로드가 이 메서드로 전달됩니다.
   */
  async validate(payload: JwtPayload) {
    // 💡 여기서 리턴된 객체는 NestJS(Passport)에 의해 컨트롤러의 요청 객체인 'request.user'에 자동으로 주입됩니다.
    // 비민감 식별자 정보만 추려서 반환합니다.
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}