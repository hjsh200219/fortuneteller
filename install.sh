#!/bin/bash

# 사주 MCP 서버 자동 설치 스크립트
# Claude Desktop에 MCP 서버를 자동으로 등록합니다

set -e

echo "🔮 사주 MCP 서버 설치 시작..."

# 1. 패키지 설치
echo ""
echo "📦 npm 패키지 설치 중..."
npm install -g @hoshin/saju-mcp-server

# 2. Claude Desktop 설정 파일 경로
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# 3. 설정 디렉토리 확인 및 생성
if [ ! -d "$CONFIG_DIR" ]; then
    echo "⚠️  Claude Desktop 설정 디렉토리가 없습니다."
    echo "   Claude Desktop이 설치되어 있는지 확인해주세요."
    exit 1
fi

# 4. 기존 설정 백업
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 기존 설정을 백업합니다: $BACKUP_FILE"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
fi

# 5. MCP 서버 설정 추가
echo ""
echo "⚙️  Claude Desktop 설정 업데이트 중..."

if [ -f "$CONFIG_FILE" ]; then
    # 기존 파일이 있는 경우 mcpServers에 추가
    if command -v jq &> /dev/null; then
        # jq가 설치되어 있으면 사용
        jq '.mcpServers.saju = {"command": "saju-mcp-server"}' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp"
        mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
    else
        # jq가 없으면 수동으로 안내
        echo "⚠️  jq가 설치되어 있지 않습니다."
        echo "   다음 설정을 수동으로 추가해주세요:"
        echo ""
        echo "   파일: $CONFIG_FILE"
        echo ""
        echo '   "mcpServers": {'
        echo '     "saju": {'
        echo '       "command": "saju-mcp-server"'
        echo '     }'
        echo '   }'
    fi
else
    # 새로운 설정 파일 생성
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "saju": {
      "command": "saju-mcp-server"
    }
  }
}
EOF
fi

echo ""
echo "✅ 설치가 완료되었습니다!"
echo ""
echo "📝 다음 단계:"
echo "   1. Claude Desktop을 재시작하세요"
echo "   2. 채팅에서 사주팔자 분석 도구를 사용할 수 있습니다"
echo ""
echo "🔧 설정 파일 위치: $CONFIG_FILE"
echo ""
echo "📚 사용 가능한 도구:"
echo "   - calculate_saju: 사주팔자 계산"
echo "   - analyze_fortune: 운세 분석"
echo "   - check_compatibility: 궁합 분석"
echo "   - convert_calendar: 음양력 변환"
echo "   - 그 외 11개 도구 사용 가능"
echo ""
echo "❓ 도움말: https://github.com/hjsh200219/fortuneteller"
