import { Controller, Post, Body, Res, UseGuards, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-auth.guard'; 
import { JwtAuthGuard } from './guards/jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * [POST /auth/login] ➔ 로그인 및 쿠키 쌍 발급
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, 
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return {
      success: true,
      user,
    };
  }

  /**
   * [POST /auth/refresh] ➔ Access Token 쿠키 리프레시(갱신)
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // =========================================================================
    // 🔑 [수정 포인트] req.user에 어떤 데이터가 들어오는지 타입스크립트에게 명시적으로 선언합니다.
    // RefreshStrategy의 validate()에서 반환한 { userId, username, role, refreshToken } 구조입니다.
    // =========================================================================
    const user = req.user as { userId: number; username: string; role: string; refreshToken: string };
    const currentRefreshToken = user?.refreshToken;

    const { accessToken } = await this.authService.refresh(currentRefreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, 
    });

    return {
      success: true,
      message: 'Access Token 갱신 완료',
    };
  }

  /**
   * [POST /auth/logout] ➔ 브라우저의 모든 인증 쿠키 강제 폭파
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      success: true,
      message: '로그아웃 성공',
    };
  }

  /**
   * [GET /auth/me] ➔ 유저 정보 영속성 확보용 API
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    return {
      success: true,
      user: req.user,
    };
  }
}