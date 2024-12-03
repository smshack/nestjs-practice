# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine AS production

# 타임존 설정
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata

WORKDIR /app

# 빌드된 파일과 필요한 파일들만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.production ./.env

# 프로덕션 의존성만 설치
# RUN npm ci --only=production
RUN npm install

# 애플리케이션 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]
