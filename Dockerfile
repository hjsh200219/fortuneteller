# 사주 MCP 서버 Docker 이미지
# Node.js 22 Alpine 기반 경량 이미지

FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 코드 복사
COPY dist ./dist

# 메타데이터
LABEL maintainer="hoshin"
LABEL description="한국 전통 사주팔자 분석 MCP 서버"
LABEL version="1.0.0"

# MCP 서버는 stdin/stdout을 사용하므로 포트 노출 불필요
# 하지만 향후 HTTP API 추가를 위해 포트 예약
EXPOSE 3000

# 서버 실행
CMD ["node", "dist/index.js"]
