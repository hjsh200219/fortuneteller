# 사주 MCP 서버 Docker 이미지 (Smithery 최적화)
FROM node:22-slim

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일만 먼저 복사 (캐싱 최적화)
COPY package*.json tsconfig.json ./

# 의존성 설치 (npm ci가 npm install보다 빠름)
RUN npm ci

# 소스 코드 복사
COPY src ./src

# 메타데이터
LABEL maintainer="hoshin"
LABEL description="한국 전통 사주팔자 분석 MCP 서버"
LABEL version="1.1.2"

# 서버 실행
CMD ["node", "dist/index.js"]
