import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
/**
 * [Refresh Token 검증을 위한 커스텀 Passport 전략]
 * 기본 'jwt' 이름과 충돌하지 않도록 'jwt-refresh'라는 고유 명칭을 super()에 주입합니다.
 */
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      // 1. 요청 헤더(Bearer) 또는 바디 등 클라이언트가 제출한 구조에서 토큰 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      // 💡 검증 성공 후 validate() 메서드에서 'req' 객체를 첫 번째 인자로 접근할 수 있도록 허용하는 옵션입니다.
      passReqToCallback: true,
    });
  }

  /**
   * [Refresh Token 무결성 검증 성공 시 자동 호출]
   * @param req Express Request 객체 (passReqToCallback 옵션 덕분에 주입됨)
   * @param payload Refresh Token 내부를 복호화한 페이로드 데이터
   */
  async validate(req: Request, payload: JwtPayload) {
    // 요청 헤더에서 원본 Refresh Token 문자열을 직접 추출합니다.
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token이 누락되었습니다.');
    }

    // 💡 복호화된 유저 정보(payload)와 함께 원본 토큰 문자열을 한 번에 리턴합니다.
    // 이 데이터는 다음 단계 가드를 통해 request.user에 통째로 바인딩됩니다.
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      refreshToken, 
    };
  }
}