import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
/**
 * [JWT 인증 인가 가드]
 * 컨트롤러나 특정 엔드포인트에 @UseGuards(JwtAuthGuard)로 지정하여 사용합니다.
 * Passport의 'jwt' 전략(JwtStrategy)을 상속받아 동작합니다.
 */
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  /**
   * 요청을 가로채서 인증 프로세스를 진행할지 여부를 결정하는 메서드입니다.
   * 부모 클래스(AuthGuard)의 기본 로직을 그대로 따르며, 필요 시 커스텀 확장이 가능합니다.
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * Passport 검증 단계가 끝난 후 최종적으로 실행되는 핸들러입니다.
   * * @param err Passport 내부 에러
   * @param user JwtStrategy의 validate()에서 리턴된 유저 객체 (성공 시)
   * @param info 토큰 만료, 누락 등 검증 실패 시 넘어오는 상세 정보
   */
  handleRequest(err: any, user: any, info: any) {
    // 1. 토큰이 아예 없거나, 만료되었거나, 위변조된 경우 (user가 없는 경우)
    if (err || !user) {
      throw err || new UnauthorizedException('인증 자격 증명이 유효하지 않거나 토큰이 누락되었습니다.');
    }
    
    // 2. 검증이 완벽히 통과되면 가공된 유저 객체를 리턴합니다.
    // 이 객체는 NestJS 내부적으로 request.user에 바인딩됩니다.
    return user;
  }
}