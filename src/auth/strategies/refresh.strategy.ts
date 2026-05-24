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
      // =========================================================================
      // 🔑 [변경] 헤더 분기 대신 브라우저가 실어 보낸 HttpOnly 쿠키에서 
      // refreshToken을 자동으로 추출하는 커스텀 추출기를 지정합니다.
      // =========================================================================
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refreshToken || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      // 검증 성공 후 validate() 메서드에서 'req' 객체를 첫 번째 인자로 접근할 수 있도록 허용하는 옵션 유지
      passReqToCallback: true,
    });
  }

  /**
   * [Refresh Token 무결성 검증 성공 시 자동 호출]
   * @param req Express Request 객체 (passReqToCallback 옵션 덕분에 주입됨)
   * @param payload Refresh Token 내부를 복호화한 페이로드 데이터
   */
  async validate(req: Request, payload: JwtPayload) {
    // =========================================================================
    // 🔑 [변경] 복잡했던 req.get('Authorization') 대신 쿠키에서 직접 원본 토큰을 추출합니다.
    // =========================================================================
    const refreshToken = req?.cookies?.refreshToken;

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


// super()의 토큰 추출기 전환:

// ExtractJwt.fromAuthHeaderAsBearerToken()을 걷어내고, req.cookies.refreshToken을 추적하도록 바꿨습니다.

// validate 내부 문자열 파싱 걷어내기:

// 기존의 req.get('Authorization')?.replace('Bearer ', '').trim() 같은 지저분한 문자열 치환 코드가 필요 없어졌습니다. req.cookies.refreshToken을 그대로 가져오기만 하면 됩니다.