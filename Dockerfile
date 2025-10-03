# 사주 MCP 서버 Docker 이미지
# Node.js 22 Slim 기반 이미지 (Smithery 호환)

FROM node:22-slim

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
COPY tsconfig.json ./

# 모든 의존성 설치 (devDependencies 포함 - TypeScript 빌드용)
RUN npm install

# 소스 코드 복사 (Smithery CLI가 src/index.ts를 찾음)
COPY src ./src
COPY data ./data

# TypeScript 빌드
RUN npm run build

# 메타데이터
LABEL maintainer="hoshin"
LABEL description="한국 전통 사주팔자 분석 MCP 서버"
LABEL version="1.1.1"

# MCP 서버는 stdin/stdout을 사용하므로 포트 노출 불필요
# 하지만 향후 HTTP API 추가를 위해 포트 예약
EXPOSE 3000

# 서버 실행 (빌드된 파일 실행)
CMD ["node", "dist/index.js"]
