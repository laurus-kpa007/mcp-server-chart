# MCP Server Chart  ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/antvis/mcp-server-chart/actions/workflows/build.yml/badge.svg)](https://github.com/antvis/mcp-server-chart/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/@antv/mcp-server-chart.svg)](https://www.npmjs.com/package/@antv/mcp-server-chart)

한국어 | **[English](./README.en.md)**

[AntV](https://github.com/antvis/)를 사용한 차트 생성을 위한 Model Context Protocol 서버입니다. 이 MCP 서버를 통해 _차트 생성_ 및 _데이터 분석_을 수행할 수 있습니다.

TypeScript 기반 MCP 서버로, 차트 생성 기능을 제공합니다. MCP 도구를 통해 다양한 유형의 차트를 생성할 수 있습니다.

## 📋 목차

- [✨ 기능](#-기능)
- [🤖 사용법](#-사용법)
- [🚰 SSE 또는 Streamable 전송으로 실행](#-sse-또는-streamable-전송으로-실행)
- [🎮 CLI 옵션](#-cli-옵션)
- [⚙️ 환경 변수](#️-환경-변수)
  - [VIS_REQUEST_SERVER](#-프라이빗-배포)
  - [SERVICE_ID](#️-생성-기록)
  - [DISABLED_TOOLS](#️-도구-필터링)
  - [한국 지도 API 키](#-한국-지도-api-설정)
- [📠 프라이빗 배포](#-프라이빗-배포)
- [🗺️ 생성 기록](#️-생성-기록)
- [🎛️ 도구 필터링](#️-도구-필터링)
- [🇰🇷 한국 지도 지원](#-한국-지도-지원)
- [🔨 개발](#-개발)
- [📄 라이선스](#-라이선스)

## ✨ 기능

현재 32개의 차트 생성 도구를 지원합니다. 기본적으로 로컬 렌더링이 활성화되어 있으며, 24종의 차트는 외부 API 없이 로컬에서 렌더링됩니다.

### 기본 차트

1. `generate_area_chart`: **영역 차트** 생성 - 연속적인 독립 변수에 따른 데이터 추세를 표시하고 전체 데이터 흐름을 관찰합니다.
2. `generate_bar_chart`: **막대 차트** 생성 - 서로 다른 카테고리의 값을 비교하며, 수평 비교에 적합합니다.
3. `generate_boxplot_chart`: **박스플롯** 생성 - 중앙값, 사분위수, 이상치를 포함한 데이터 분포를 표시합니다.
4. `generate_column_chart`: **세로 막대 차트** 생성 - 서로 다른 카테고리의 값을 비교하며, 수직 비교에 적합합니다.
5. `generate_dual_axes_chart`: **이중 축 차트** 생성 - 단위나 범위가 다른 두 변수 간의 관계를 표시합니다.
6. `generate_funnel_chart`: **깔때기 차트** 생성 - 여러 단계에서의 데이터 손실을 표시합니다.
7. `generate_histogram_chart`: **히스토그램** 생성 - 데이터를 구간으로 나누고 각 구간의 데이터 개수를 세어 분포를 표시합니다.
8. `generate_line_chart`: **선 차트** 생성 - 시간 또는 다른 연속 변수에 따른 데이터 추세를 표시합니다.
9. `generate_liquid_chart`: **리퀴드 차트** 생성 - 데이터 비율을 표시하며, 물이 차오르는 구 형태로 백분율을 시각적으로 나타냅니다.
10. `generate_pie_chart`: **원형 차트** 생성 - 데이터 비율을 표시하며, 각 부분의 백분율을 보여주는 섹터로 나눕니다.
11. `generate_radar_chart`: **레이더 차트** 생성 - 다차원 데이터를 종합적으로 표시하며, 여러 차원을 레이더 형식으로 보여줍니다.
12. `generate_sankey_chart`: **생키 차트** 생성 - 데이터 흐름과 양을 표시하며, 서로 다른 노드 간의 데이터 이동을 생키 스타일로 나타냅니다.
13. `generate_scatter_chart`: **산점도** 생성 - 두 변수 간의 관계를 표시하며, 좌표계에 분산된 점으로 데이터 포인트를 보여줍니다.
14. `generate_treemap_chart`: **트리맵** 생성 - 계층적 데이터를 표시하며, 직사각형 크기가 데이터 값을 나타냅니다.
15. `generate_waterfall_chart`: **폭포 차트** 생성 - 순차적으로 도입되는 양수 또는 음수 값의 누적 효과를 시각화합니다. 재무 분석, 예산 추적, 손익 분석에 적합합니다.
16. `generate_violin_chart`: **바이올린 플롯** 생성 - 데이터 분포를 표시하며, 박스플롯과 밀도 플롯의 특징을 결합하여 더 상세한 분포를 제공합니다.

### 다이어그램 및 그래프

17. `generate_fishbone_diagram`: **피쉬본 다이어그램** 생성 - 이시카와 다이어그램이라고도 하며, 문제의 근본 원인을 식별하고 표시하는 데 사용됩니다.
18. `generate_flow_diagram`: **순서도** 생성 - 프로세스의 단계와 순서를 표시하는 데 사용됩니다.
19. `generate_mind_map`: **마인드맵** 생성 - 사고 과정과 계층적 정보를 표시하는 데 사용됩니다.
20. `generate_network_graph`: **네트워크 그래프** 생성 - 노드 간의 관계와 연결을 표시하는 데 사용됩니다.
21. `generate_organization_chart`: **조직도** 생성 - 조직의 구조와 인력 관계를 표시하는 데 사용됩니다.
22. `generate_venn_chart`: **벤 다이어그램** 생성 - 집합 간의 관계를 표시하며, 교집합, 합집합, 차집합을 보여줍니다.
23. `generate_word_cloud_chart`: **워드 클라우드** 생성 - 텍스트 데이터의 단어 빈도를 표시하며, 글꼴 크기가 각 단어의 빈도를 나타냅니다.

### 데이터 테이블

24. `generate_spreadsheet`: **스프레드시트/피벗 테이블** 생성 - 표 형식의 데이터를 표시합니다. `rows` 또는 `values` 필드를 제공하면 피벗 테이블로, 그렇지 않으면 일반 테이블로 렌더링됩니다.

### 중국 지도 차트 (AMap 서비스 사용)

25. `generate_district_map`: **행정구역 지도** 생성 - 중국 행정구역과 데이터 분포를 표시합니다.
26. `generate_path_map`: **경로 지도** 생성 - 중국 내 관심 지점(POI)의 경로 계획 결과를 표시합니다.
27. `generate_pin_map`: **핀 지도** 생성 - 중국 내 관심 지점(POI)의 분포를 표시합니다.

> [!NOTE]
> 위의 중국 지도 시각화 차트 생성 도구는 [고덕지도(AMap) 서비스](https://lbs.amap.com/)를 사용하며 현재 중국 내 지도 생성만 지원합니다.

### 🇰🇷 한국 지도 차트

28. `generate_korea_district_map`: **한국 행정구역 지도** 생성 - 대한민국의 시/도, 시/군/구 행정구역과 데이터 분포를 표시합니다.
29. `generate_korea_path_map`: **한국 경로 지도** 생성 - 대한민국 내 관심 지점의 경로 계획을 표시합니다.
30. `generate_korea_pin_map`: **한국 핀 지도** 생성 - 대한민국 내 관심 지점의 분포를 표시합니다.

> [!NOTE]
> 한국 지도 시각화 도구는 Kakao Maps 또는 Naver Maps API를 사용합니다. 사용하려면 API 키를 환경 변수로 설정해야 합니다.

> [!IMPORTANT]
> 지도 도구 6종(중국 3종, 한국 3종)은 외부 지도 서비스가 필요하므로 **기본적으로 비활성화**되어 있습니다. 사용하려면 `DISABLED_TOOLS` 환경 변수를 설정하여 기본값을 덮어쓰세요.

## 🤖 사용법

Claude, VSCode, [Cline](https://cline.bot/mcp-marketplace), Cherry Studio, Cursor 등의 데스크톱 앱에서 사용하려면 아래 MCP 서버 설정을 추가하세요.

### Mac 시스템:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ]
    }
  }
}
```

### Windows 시스템:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@antv/mcp-server-chart"
      ]
    }
  }
}
```

## 🚰 SSE 또는 Streamable 전송으로 실행

### 직접 실행

패키지를 전역으로 설치합니다.

```bash
npm install -g @antv/mcp-server-chart
```

선호하는 전송 옵션으로 서버를 실행합니다:

```bash
# SSE 전송 (기본 엔드포인트: /sse)
mcp-server-chart --transport sse

# 사용자 지정 엔드포인트를 사용한 Streamable 전송
mcp-server-chart --transport streamable
```

그런 다음 다음 주소에서 서버에 액세스할 수 있습니다:

- SSE 전송: `http://localhost:1122/sse`
- Streamable 전송: `http://localhost:1122/mcp`

### Docker 배포

docker 디렉토리로 이동합니다.

```bash
cd docker
```

docker-compose를 사용하여 배포합니다.

```bash
docker compose up -d
```

그런 다음 다음 주소에서 서버에 액세스할 수 있습니다:

- SSE 전송: `http://localhost:1123/sse`
- Streamable 전송: `http://localhost:1122/mcp`

## 🎮 CLI 옵션

MCP 서버 실행 시 다음 CLI 옵션을 사용할 수 있습니다. `-H`로 명령 옵션을 확인할 수 있습니다.

```plain
MCP Server Chart CLI

옵션:
  --transport, -t  전송 프로토콜 지정: "stdio", "sse", 또는 "streamable" (기본값: "stdio")
  --host, -h       SSE 또는 streamable 전송의 호스트 지정 (기본값: "localhost")
  --port, -p       SSE 또는 streamable 전송의 포트 지정 (기본값: 1122)
  --endpoint, -e   전송의 엔드포인트 지정:
                   - SSE의 경우: 기본값은 "/sse"
                   - streamable의 경우: 기본값은 "/mcp"
  --help, -H       이 도움말 메시지 표시
```

## ⚙️ 환경 변수

| 변수 | 설명 | 기본값 | 예시 |
|----------|:------------|---------|---------|
| `VIS_REQUEST_SERVER` | 프라이빗 배포를 위한 사용자 지정 차트 생성 서비스 URL | `https://antv-studio.alipay.com/api/gpt-vis` | `https://your-server.com/api/chart` |
| `SERVICE_ID` | 차트 생성 기록을 위한 서비스 식별자 | - | `your-service-id-123` |
| `DISABLED_TOOLS` | 비활성화할 도구 이름의 쉼표로 구분된 목록 | 지도 도구 6종 비활성화 | `generate_fishbone_diagram,generate_mind_map` |
| `USE_LOCAL_RENDERER` | 로컬 렌더링 사용 여부 | `true` | `false` |
| `OUTPUT_DIR` | 로컬 렌더링 시 차트 출력 디렉토리 | `./output` | `/path/to/output` |
| `LOCALE` | 인터페이스 언어 설정 | `en` | `ko`, `zh`, `en` |
| `KAKAO_MAP_API_KEY` | Kakao Maps API 키 (한국 지도용) | - | `your-kakao-api-key` |
| `NAVER_MAP_CLIENT_ID` | Naver Maps 클라이언트 ID (한국 지도용) | - | `your-naver-client-id` |
| `NAVER_MAP_CLIENT_SECRET` | Naver Maps 클라이언트 시크릿 (한국 지도용) | - | `your-naver-client-secret` |

### 📠 프라이빗 배포

`MCP Server Chart`는 기본적으로 무료 차트 생성 서비스를 제공합니다. 프라이빗 배포가 필요한 사용자는 `VIS_REQUEST_SERVER`를 사용하여 자체 차트 생성 서비스를 커스터마이즈할 수 있습니다.

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ],
      "env": {
        "VIS_REQUEST_SERVER": "<YOUR_VIS_REQUEST_SERVER>"
      }
    }
  }
}
```

AntV의 프로젝트 [GPT-Vis-SSR](https://github.com/antvis/GPT-Vis/tree/main/bindings/gpt-vis-ssr)을 사용하여 프라이빗 환경에 HTTP 서비스를 배포한 다음, env `VIS_REQUEST_SERVER`를 통해 URL 주소를 전달할 수 있습니다.

- **메서드**: `POST`
- **매개변수**: 렌더링을 위해 `GPT-Vis-SSR`로 전달됩니다. 예: `{ "type": "line", "data": [{ "time": "2025-05", "value": 512 }, { "time": "2025-06", "value": 1024 }] }`.
- **반환값**: HTTP 서비스의 반환 객체.
  - **success**: `boolean` 차트 이미지 생성 성공 여부.
  - **resultObj**: `string` 차트 이미지 URL.
  - **errorMessage**: `string` `success = false`일 때 오류 메시지를 반환합니다.

> [!NOTE]
> 프라이빗 배포 솔루션은 현재 6개의 지리적 시각화 차트 생성 도구를 지원하지 않습니다: `generate_district_map`, `generate_path_map`, `generate_pin_map`, `generate_korea_district_map`, `generate_korea_path_map`, `generate_korea_pin_map`.

### 🗺️ 생성 기록

기본적으로 사용자는 결과를 직접 저장해야 하지만, 차트 생성 기록을 볼 수 있는 서비스도 제공하며, 이를 위해 사용자가 직접 서비스 식별자를 생성하고 설정해야 합니다.

다음 단계는 중국의 알리페이 미니 프로그램을 사용하는 예시입니다. 한국 사용자는 이 기능을 사용하지 못할 수 있습니다.

### 🎛️ 도구 필터링

`DISABLED_TOOLS` 환경 변수를 사용하여 특정 차트 생성 도구를 비활성화할 수 있습니다. 이는 특정 도구가 MCP 클라이언트와 호환성 문제가 있거나 사용 가능한 기능을 제한하고 싶을 때 유용합니다.

기본적으로 지도 도구 6종이 비활성화되어 있습니다:
- `generate_district_map`, `generate_path_map`, `generate_pin_map`
- `generate_korea_district_map`, `generate_korea_pin_map`, `generate_korea_path_map`

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ],
      "env": {
        "DISABLED_TOOLS": "generate_fishbone_diagram,generate_mind_map"
      }
    }
  }
}
```

> [!NOTE]
> `DISABLED_TOOLS`를 설정하면 기본 비활성화 목록이 **덮어쓰기**됩니다. 지도 도구도 함께 비활성화하려면 목록에 포함해야 합니다.

**필터링 가능한 도구 이름** [✨ 기능](#-기능)을 참조하세요.

## 🇰🇷 한국 지도 지원

한국 지도 기능을 사용하려면 Kakao Maps 또는 Naver Maps API 키가 필요합니다.

### Kakao Maps API 키 발급

1. [Kakao Developers](https://developers.kakao.com/)에 접속하여 로그인
2. "내 애플리케이션" > "애플리케이션 추가하기"
3. 앱 생성 후 "JavaScript 키" 또는 "REST API 키" 복사
4. 환경 변수에 추가:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "KAKAO_MAP_API_KEY": "your-kakao-api-key"
      }
    }
  }
}
```

### Naver Maps API 키 발급

1. [Naver Cloud Platform](https://www.ncloud.com/)에 접속하여 로그인
2. "AI·NAVER API" > "Application 등록"
3. "Maps" 서비스 선택 및 등록
4. Client ID와 Client Secret 복사
5. 환경 변수에 추가:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "NAVER_MAP_CLIENT_ID": "your-naver-client-id",
        "NAVER_MAP_CLIENT_SECRET": "your-naver-client-secret"
      }
    }
  }
}
```

### 한국 지도 사용 예시

```javascript
// 서울 주요 관광지 지도
{
  "title": "서울 주요 관광지",
  "data": ["서울 남산타워", "서울 경복궁", "서울 명동성당", "서울 청계천"],
  "mapProvider": "kakao"
}

// 대한민국 시도별 인구 분포
{
  "title": "대한민국 광역시도 인구 분포",
  "data": {
    "name": "대한민국",
    "showAllSubdistricts": true,
    "dataLabel": "인구",
    "dataType": "number",
    "dataValueUnit": "만명",
    "colors": ["#4ECDC4"],
    "subdistricts": [
      {"name": "서울특별시", "dataValue": "967"},
      {"name": "부산광역시", "dataValue": "339"},
      {"name": "경기도", "dataValue": "1356"}
    ]
  },
  "mapProvider": "kakao"
}
```

## 🔨 개발

의존성 설치:

```bash
npm install
```

서버 빌드:

```bash
npm run build
```

MCP Inspector로 서버 시작:

```bash
npm run start
```

테스트 실행:

```bash
npm run test
```

SSE 전송으로 MCP 서버 시작:

```bash
node build/index.js -t sse
```

Streamable 전송으로 MCP 서버 시작:

```bash
node build/index.js -t streamable
```

## 📄 라이선스

MIT@[AntV](https://github.com/antvis).
