# MCP Server Chart 설치 및 실행 가이드

## 📦 설치 방법

### 1. 개발 모드로 실행

프로젝트를 클론하고 로컬에서 개발하는 경우:

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 서버 실행 (stdio 모드)
npm run start
```

### 2. 글로벌 설치

npm을 통해 전역으로 설치하여 사용:

```bash
# 글로벌 설치
npm install -g @antv/mcp-server-chart

# 서버 실행
mcp-server-chart
```

### 3. npx로 직접 실행

설치 없이 바로 실행:

```bash
npx @antv/mcp-server-chart
```

## 🚀 실행 모드

### stdio 모드 (기본)

MCP 클라이언트와 표준 입출력으로 통신:

```bash
npm run start
# 또는
mcp-server-chart
```

### SSE 모드

Server-Sent Events를 사용한 HTTP 서버:

```bash
# 개발 모드
node build/index.js -t sse

# 글로벌 설치 후
mcp-server-chart --transport sse

# 커스텀 포트
mcp-server-chart --transport sse --port 3000
```

접속 URL: `http://localhost:1122/sse`

### Streamable 모드

Streamable 프로토콜을 사용한 HTTP 서버:

```bash
# 개발 모드
node build/index.js -t streamable

# 글로벌 설치 후
mcp-server-chart --transport streamable

# 커스텀 포트와 엔드포인트
mcp-server-chart --transport streamable --port 3000 --endpoint /custom
```

접속 URL: `http://localhost:1122/mcp`

## 🐳 Docker로 실행

### Docker Compose 사용

```bash
# docker 디렉토리로 이동
cd docker

# 서비스 시작
docker compose up -d

# 로그 확인
docker compose logs -f

# 서비스 중지
docker compose down
```

실행 후 접속:
- SSE: `http://localhost:1123/sse`
- Streamable: `http://localhost:1122/mcp`

### Dockerfile로 직접 빌드

```bash
# 이미지 빌드
docker build -t mcp-server-chart .

# 컨테이너 실행
docker run -p 1122:1122 mcp-server-chart
```

## 🎮 CLI 옵션

```bash
mcp-server-chart [options]

Options:
  --transport, -t  전송 프로토콜 지정: "stdio", "sse", "streamable" (기본값: "stdio")
  --port, -p       SSE/streamable 포트 지정 (기본값: 1122)
  --endpoint, -e   전송 엔드포인트 지정
                   - SSE: 기본값 "/sse"
                   - Streamable: 기본값 "/mcp"
  --help, -h       도움말 표시
```

### 사용 예시

```bash
# SSE 모드, 포트 3000
mcp-server-chart -t sse -p 3000

# Streamable 모드, 커스텀 엔드포인트
mcp-server-chart -t streamable -e /custom-endpoint

# 전체 옵션 사용
mcp-server-chart --transport sse --port 8080 --endpoint /api/sse
```

## 🔧 MCP 클라이언트 설정

### Claude Desktop (Mac)

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"]
    }
  }
}
```

### Claude Desktop (Windows)

`%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@antv/mcp-server-chart"]
    }
  }
}
```

### 환경 변수 설정 포함

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "VIS_REQUEST_SERVER": "https://your-server.com/api/chart",
        "SERVICE_ID": "your-service-id",
        "DISABLED_TOOLS": "generate_fishbone_diagram,generate_mind_map"
      }
    }
  }
}
```

## ⚙️ 환경 변수

| 변수 | 설명 | 기본값 | 예시 |
|------|------|--------|------|
| `USE_LOCAL_RENDERER` | 로컬 렌더링 사용 여부 | `false` | `true` |
| `OUTPUT_DIR` | 로컬 생성된 차트 이미지 저장 경로 | `./output` | `./charts` 또는 `D:/charts` |
| `VIS_REQUEST_SERVER` | 프라이빗 차트 생성 서비스 URL | `https://antv-studio.alipay.com/api/gpt-vis` | `https://your-server.com/api/chart` |
| `SERVICE_ID` | 차트 생성 기록용 서비스 식별자 | - | `your-service-id-123` |
| `DISABLED_TOOLS` | 비활성화할 도구 목록 (쉼표로 구분) | - | `generate_fishbone_diagram,generate_mind_map` |

### 🖼️ 로컬 렌더링 사용

차트를 외부 API 대신 로컬에서 생성하고 이미지 파일로 저장하려면:

**Claude Desktop 설정 (Windows):**

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@antv/mcp-server-chart"],
      "env": {
        "USE_LOCAL_RENDERER": "true",
        "OUTPUT_DIR": "D:/charts"
      }
    }
  }
}
```

**로컬 개발 시:**

```bash
# 환경 변수 설정 (Windows PowerShell)
$env:USE_LOCAL_RENDERER="true"
$env:OUTPUT_DIR="D:/charts"
npm run start

# 환경 변수 설정 (Windows CMD)
set USE_LOCAL_RENDERER=true
set OUTPUT_DIR=D:/charts
npm run start
```

**동작 방식:**
- `USE_LOCAL_RENDERER=true`: 차트가 외부 API가 아닌 로컬에서 생성됩니다
- `OUTPUT_DIR`: 생성된 PNG 이미지가 저장될 디렉토리 경로
- 반환값: 외부 URL 대신 로컬 파일의 절대 경로 (예: `D:\charts\line-1234567890.png`)
- 자동으로 출력 디렉토리가 생성됩니다

**주의사항:**
- 로컬 렌더링은 `@antv/gpt-vis-ssr` 패키지를 사용합니다
- 지도 차트(district-map, path-map, pin-map)는 로컬 렌더링을 지원하지 않을 수 있습니다

## 🧪 개발 및 테스트

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 테스트 실행
npm test

# 개발 모드로 실행 (MCP Inspector 포함)
npm run start
```

## 📝 문제 해결

### 포트가 이미 사용 중인 경우

다른 포트 지정:
```bash
mcp-server-chart -t sse -p 3000
```

### 빌드 오류 발생 시

```bash
# build 폴더 삭제 후 재빌드
rm -rf build
npm run build
```

### Windows에서 권한 오류 발생 시

관리자 권한으로 실행하거나 다음 명령어 사용:
```bash
npm install -g @antv/mcp-server-chart --force
```

## 📚 추가 리소스

- [MCP 프로토콜 문서](https://modelcontextprotocol.io/)
- [AntV 공식 문서](https://antv.vision/)
- [프로젝트 GitHub](https://github.com/antvis/mcp-server-chart)
