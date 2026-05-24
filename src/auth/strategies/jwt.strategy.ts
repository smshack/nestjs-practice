import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express'; // 💡 Express Request 타입을 명시적으로 가져옵니다.

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
      // =========================================================================
      // 🔑 [변경] 기존 Bearer 헤더 대신 브라우저가 실어 보낸 HttpOnly 쿠키에서 
      // accessToken을 자동으로 추출하는 커스텀 추출기를 지정합니다.
      // =========================================================================
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // main.ts의 cookieParser() 덕분에 req.cookies 객체에서 바로 꺼낼 수 있습니다.
          return req?.cookies?.accessToken || null;
        },
      ]),

      // 2. 토큰이 만료되었을 경우 Passport 자체적으로 요청을 즉시 차단(401 Unauthorized)하도록 설정
      ignoreExpiration: false,

      // 3. 토큰의 위변조 여부를 확인할 비밀키 매핑
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  /**
   * [JWT 서명/만료 검증 성공 시 자동 실행]
   * 쿠키에서 추출한 토큰 검증이 "통과"되면 복호화된 페이로드가 이 메서드로 전달됩니다.
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


// ExtractJwt.fromExtractors 활용:

// 단일 매핑 함수((req) => ...)를 사용할 때 간혹 가다 여타 라이브러리 인터페이스와 씹히는 컴파일 에러를 완벽히 방어하기 위해, passport-jwt 패키지가 공식 지원하는 배열 형태의 fromExtractors 유틸리티 함수를 사용하는 것이 실무 정석 문법입니다.

// main.ts와의 유기적 흐름:

// 앞 단계에서 설치하신 app.use(cookieParser()) 덕분에, 이 전략(Strategy)이 실행되기 직전 요청 객체에 req.cookies 필드가 완벽히 동기화되어 매끄럽게 토큰을 추출하게 됩니다.