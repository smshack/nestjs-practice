import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    // 1. 현재 모듈에서 사용할 TypeORM 엔티티 등록 (UserRepository 주입이 가능해집니다)
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [
    // 2. 외부 HTTP 요청을 받고 응답을 처리하는 라우팅 진입점 등록
    UserController,
  ],
  providers: [
    // 3. 비즈니스 로직을 처리하는 서비스 등록 (Nest DI 컨테이너가 인스턴스를 관리합니다)
    UserService,
  ],
  exports: [
    // 4. AuthModule 등 다른 모듈에서 UserService를 주입받아 사용할 수 있도록 밖으로 노출
    UserService,
  ],
})
export class UserModule {}