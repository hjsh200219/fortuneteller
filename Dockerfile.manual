# 빌드 스테이지
FROM node:22-slim AS builder

WORKDIR /app

# 패키지 파일과 TypeScript 설정 복사
COPY package*.json tsconfig.json ./

# 모든 의존성 설치 (개발 의존성 포함)
RUN npm ci

# 소스 코드 복사
COPY src ./src

# TypeScript 빌드
RUN npm run build

# 프로덕션 스테이지
FROM node:22-slim

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 메타데이터
LABEL maintainer="hoshin"
LABEL description="한국 전통 사주팔자 분석 MCP 서버"
LABEL version="1.1.2"

# MCP 서버 실행
CMD ["node", "dist/index.js"]
