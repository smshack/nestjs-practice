import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * [POST /user] - 신규 회원 가입
   * @param createUserDto 회원가입 요청 데이터 (username, password)
   */
  @Post()
  @ApiOperation({
    summary: '신규 회원 가입',
    description: '비밀번호 암호화 후 유저를 생성합니다. (중복 검사는 서비스 계층에서 수행)',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공 및 유저 정보 반환 (비밀번호 제외)' })
  @ApiResponse({ status: 400, description: '이미 존재하는 사용자 아이디 (ValidationException)' })
  async create(@Body() createUserDto: CreateUserDto) {
    // 1. 보안 필수: DB 저장 전 사용자가 입력한 비밀번호를 단방향 암호화(Bcrypt) 처리
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 2. 서비스 계층으로 데이터 이관 (중복 검사는 userService.create 내부에서 자동 처리됨)
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 3. 민감 정보(비밀번호, 리프레시 토큰)를 응답 객체에서 제외하고 안전하게 반환
    const { password, refreshToken, ...result } = user;
    return result;
  }

  /**
   * [GET /user/me] - 로그인한 현재 사용자 정보 조회
   * @param req JwtAuthGuard(JwtStrategy)를 통해 유저 정보가 바인딩된 Express Request 객체
   */
  @Get('me')
  @UseGuards(JwtAuthGuard) // 💡 인가 Guard: 유효한 Access Token이 유입되었는지 체크
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'Headers에 Bearer AccessToken 전송이 필요합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '토큰 만료 혹은 자격 증명 유효하지 않음' })
  getMe(@Req() req: any) {
    // JwtStrategy의 validate()가 리턴한 { userId, username, role } 데이터가 req.user에 매핑되어 있습니다.
    return {
      success: true,
      user: req.user,
    };
  }
}