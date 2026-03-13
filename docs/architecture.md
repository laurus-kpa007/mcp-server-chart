# MCP Server Chart - Architecture

한국어 | [English](#english)

---

## 시스템 아키텍처 개요

MCP Server Chart의 전체 시스템 구성도입니다. 클라이언트부터 차트 출력까지의 전체 구조를 보여줍니다.

```mermaid
graph TB
    subgraph Clients["클라이언트"]
        Claude["Claude Desktop"]
        Cursor["Cursor / VSCode"]
        Cline["Cline"]
        Cherry["Cherry Studio"]
        Agent["Custom Agent"]
    end

    subgraph Transport["전송 계층 (Transport Layer)"]
        STDIO["Stdio Transport<br/>stdin/stdout"]
        SSE["SSE Transport<br/>GET /sse · POST /messages"]
        HTTP["Streamable HTTP<br/>POST /mcp"]
    end

    subgraph Server["MCP Server Core"]
        MCPServer["MCP Server Instance<br/><i>@modelcontextprotocol/sdk</i>"]
        ListTools["ListToolsRequest<br/>도구 목록 반환"]
        CallTool["CallToolRequest<br/>도구 실행 라우팅"]
        ToolCache["Tool Cache<br/><i>getEnabledTools()</i>"]
        SchemaCache["Schema Cache<br/><i>COMPILED_SCHEMA_CACHE</i>"]
    end

    subgraph Charts["차트 정의 (32종)"]
        Basic["기본 차트 16종<br/>area, bar, column, line, pie,<br/>scatter, radar, funnel, sankey,<br/>histogram, boxplot, violin,<br/>liquid, treemap, dual-axes,<br/>waterfall"]
        Diagram["다이어그램 7종<br/>fishbone, flow, mind-map,<br/>network, org-chart,<br/>venn, word-cloud"]
        Table["데이터 테이블 1종<br/>spreadsheet"]
        MapCN["중국 지도 3종<br/>district, path, pin"]
        MapKR["한국 지도 3종<br/>korea-district,<br/>korea-path, korea-pin"]
        BaseSchema["Base Schema<br/>theme, width, height,<br/>title, texture, palette"]
    end

    subgraph Rendering["렌더링 엔진"]
        Validator["Zod Validation<br/>입력 스키마 검증"]
        LocalRenderer["Local Renderer<br/><i>@antv/gpt-vis-ssr</i><br/>24종 지원"]
        CustomRenderer["Custom Renderer<br/>waterfall · spreadsheet<br/><i>@antv/g2-ssr</i>"]
        RemoteAPI["Remote API<br/><i>VIS_REQUEST_SERVER</i>"]
        MapAPI["Map Service<br/>AMap · Kakao · Naver"]
    end

    subgraph Output["출력"]
        PNG["PNG 파일<br/><i>OUTPUT_DIR</i>"]
        URL["이미지 URL<br/><i>원격 서버 반환</i>"]
        Meta["메타데이터<br/>spec · description"]
    end

    Clients --> Transport
    STDIO --> MCPServer
    SSE --> MCPServer
    HTTP --> MCPServer
    MCPServer --> ListTools
    MCPServer --> CallTool
    ListTools --> ToolCache
    ToolCache --> Charts
    CallTool --> SchemaCache
    SchemaCache --> Validator
    Validator --> LocalRenderer
    Validator --> RemoteAPI
    Validator --> MapAPI
    LocalRenderer --> PNG
    CustomRenderer --> PNG
    LocalRenderer -.->|"미지원 타입"| RemoteAPI
    RemoteAPI --> URL
    MapAPI --> URL
    PNG --> Meta
    URL --> Meta
    Meta --> MCPServer
    BaseSchema --> Basic
    BaseSchema --> Diagram

    style Clients fill:#e8f4fd,stroke:#2196f3
    style Transport fill:#fff3e0,stroke:#ff9800
    style Server fill:#f3e5f5,stroke:#9c27b0
    style Charts fill:#e8f5e9,stroke:#4caf50
    style Rendering fill:#fce4ec,stroke:#e91e63
    style Output fill:#fff9c4,stroke:#ffc107
```

## 요청 처리 흐름 (Request Lifecycle)

클라이언트가 차트를 생성 요청할 때의 전체 흐름입니다.

```mermaid
sequenceDiagram
    actor Client as 클라이언트
    participant Transport as 전송 계층
    participant Server as MCP Server
    participant Handler as Tool Handler
    participant Validator as Zod Validator
    participant Router as 렌더링 라우터
    participant Local as 로컬 렌더러
    participant Remote as 원격 API

    Client->>Transport: CallToolRequest<br/>{name, arguments}
    Transport->>Server: JSON-RPC 메시지 전달

    Server->>Handler: callTool(name, args)
    Handler->>Handler: 도구명 → 차트 타입 매핑<br/>generate_bar_chart → "bar"

    Handler->>Validator: schema.safeParse(args)

    alt 검증 실패
        Validator-->>Handler: ValidationError
        Handler-->>Client: McpError(InvalidParams)
    end

    Validator-->>Handler: 검증 성공

    alt 지도 차트 (6종)
        Handler->>Remote: generateMap(tool, input)
        Remote-->>Handler: {metadata, content}
    else 일반 차트 (26종)
        Handler->>Router: generateChartUrl(type, options)

        alt 로컬 렌더링 가능 (24종)
            Router->>Local: generateLocalChart(type, options)
            Local->>Local: gpt-vis-ssr render()<br/>또는 Custom renderer
            Local->>Local: PNG 파일 저장
            Local-->>Router: 파일 경로 반환
        else 로컬 미지원 or 비활성화
            Router->>Remote: HTTP POST<br/>{type, ...options}
            Remote-->>Router: 이미지 URL 반환
        end

        Router-->>Handler: URL 또는 파일 경로
    end

    Handler-->>Server: {content, _meta: {spec}}
    Server-->>Transport: JSON-RPC 응답
    Transport-->>Client: 차트 결과
```

## 전송 프로토콜 비교

세 가지 전송 프로토콜의 연결 및 통신 흐름입니다.

```mermaid
graph LR
    subgraph STDIO["Stdio Transport"]
        direction TB
        C1["클라이언트"] -->|"stdin"| P1["MCP Server<br/>(자식 프로세스)"]
        P1 -->|"stdout"| C1
        P1 -->|"로그"| STDERR["stderr"]
    end

    subgraph SSE_T["SSE Transport"]
        direction TB
        C2["클라이언트"] -->|"GET /sse"| SSE_S["Express Server<br/>:1122"]
        SSE_S -->|"SSE Stream<br/>(sessionId)"| C2
        C2 -->|"POST /messages<br/>?sessionId=X"| SSE_S
        SSE_S --> CONN["connections<br/>{sessionId: transport}"]
    end

    subgraph HTTP_T["Streamable HTTP"]
        direction TB
        C3["클라이언트"] -->|"POST /mcp"| HTTP_S["Express Server<br/>:1122"]
        HTTP_S -->|"JSON 응답<br/>or SSE Stream"| C3
        HTTP_S --> CORS["CORS<br/>Mcp-Session-Id"]
    end

    style STDIO fill:#e3f2fd,stroke:#1565c0
    style SSE_T fill:#fff8e1,stroke:#f9a825
    style HTTP_T fill:#f1f8e9,stroke:#558b2f
```

## 렌더링 엔진 의사결정 트리

차트 생성 요청 시 로컬/원격 렌더링을 결정하는 흐름입니다.

```mermaid
flowchart TD
    Start["generateChartUrl(type, options)"] --> IsMap{지도 차트?}

    IsMap -->|Yes| MapAPI["generateMap()<br/>→ 원격 지도 API 호출"]
    MapAPI --> MapResult["지도 이미지 URL + 메타데이터"]

    IsMap -->|No| CheckLocal{USE_LOCAL_RENDERER<br/>= true?}

    CheckLocal -->|No| RemoteOnly["원격 API 호출<br/>VIS_REQUEST_SERVER"]
    RemoteOnly --> RemoteURL["이미지 URL 반환"]

    CheckLocal -->|Yes| CheckType{LOCAL_SUPPORTED_TYPES<br/>에 포함?}

    CheckType -->|No| Fallback["원격 API 폴백"]
    Fallback --> RemoteURL

    CheckType -->|Yes| CheckCustom{커스텀 렌더러?}

    CheckCustom -->|"waterfall"| WaterfallR["G2-SSR<br/>커스텀 폭포 차트"]
    CheckCustom -->|"spreadsheet"| SpreadR["G2-SSR<br/>히트맵/테이블"]
    CheckCustom -->|"기타 22종"| GptVis["gpt-vis-ssr<br/>render()"]

    WaterfallR --> SavePNG["PNG 저장<br/>OUTPUT_DIR/{type}-{timestamp}.png"]
    SpreadR --> SavePNG
    GptVis --> SavePNG

    SavePNG --> FilePath["절대 파일 경로 반환"]

    style Start fill:#e1f5fe,stroke:#0288d1
    style MapResult fill:#fff9c4,stroke:#f9a825
    style RemoteURL fill:#fff9c4,stroke:#f9a825
    style FilePath fill:#c8e6c9,stroke:#388e3c
    style MapAPI fill:#ffccbc,stroke:#e64a19
    style Fallback fill:#ffccbc,stroke:#e64a19
    style RemoteOnly fill:#ffccbc,stroke:#e64a19
```

## 도구 등록 및 필터링

서버 시작 시 도구가 등록되고 필터링되는 과정입니다.

```mermaid
flowchart LR
    subgraph ChartDefs["차트 정의 (32종)"]
        All["src/charts/index.ts<br/>32개 차트 export"]
    end

    subgraph Filtering["도구 필터링"]
        Env["DISABLED_TOOLS<br/>환경 변수"]
        Default["기본 비활성화<br/>지도 6종"]
        Env -->|"설정됨"| Override["사용자 목록<br/>으로 대체"]
        Env -->|"미설정"| Default
    end

    subgraph Enabled["활성화된 도구"]
        Tools["getEnabledTools()<br/>필터링된 도구 배열"]
        Cache["캐시 저장<br/>(첫 호출 시 1회)"]
    end

    All --> Filtering
    Override --> Tools
    Default --> Tools
    Tools --> Cache

    subgraph Registration["MCP 등록"]
        List["ListToolsRequest<br/>→ 도구 목록 반환"]
        Call["CallToolRequest<br/>→ 도구 실행"]
    end

    Cache --> List
    Cache --> Call

    style ChartDefs fill:#e8f5e9,stroke:#4caf50
    style Filtering fill:#fff3e0,stroke:#ff9800
    style Enabled fill:#e3f2fd,stroke:#1565c0
    style Registration fill:#f3e5f5,stroke:#9c27b0
```

## 에이전트 통합 예제

`examples/chart-agent/`의 에이전트가 MCP 서버와 통신하는 흐름입니다.

```mermaid
sequenceDiagram
    actor User as 사용자
    participant Agent as Chart Agent
    participant MCP as MCP Client<br/>(StdioClientTransport)
    participant Server as MCP Server<br/>(자식 프로세스)
    participant LLM as LLM<br/>(OpenAI/LM Studio)

    User->>Agent: 차트 요청 입력

    Note over Agent,Server: 초기화 (1회)
    Agent->>Server: StdioClientTransport로<br/>MCP 서버 프로세스 시작
    Agent->>MCP: client.connect(transport)
    Agent->>MCP: client.listTools()
    MCP-->>Agent: 사용 가능한 도구 목록

    Note over Agent,LLM: 차트 생성 루프
    Agent->>LLM: 사용자 메시지 +<br/>도구 목록 전송
    LLM-->>Agent: tool_calls 응답<br/>{name, arguments}

    loop 도구 호출 (최대 5회)
        Agent->>MCP: client.callTool(name, args)
        MCP->>Server: CallToolRequest
        Server-->>MCP: 차트 결과 (파일 경로)
        MCP-->>Agent: 도구 실행 결과
        Agent->>LLM: 결과 피드백
        LLM-->>Agent: 최종 응답 or 추가 tool_call
    end

    Agent->>Agent: openFile() - 차트 이미지 열기
    Agent-->>User: 완료 메시지 + 차트 표시
```

## 프로젝트 디렉토리 구조

```mermaid
graph TD
    Root["mcp-server-chart/"]

    Root --> Src["src/"]
    Root --> Examples["examples/"]
    Root --> Docker["docker/"]
    Root --> Docs["docs/"]

    Src --> Index["index.ts<br/><i>CLI 진입점</i>"]
    Src --> ServerTS["server.ts<br/><i>MCP 서버 생성</i>"]
    Src --> SDK["sdk.ts<br/><i>공개 API</i>"]

    Src --> Services["services/"]
    Services --> StdioS["stdio.ts"]
    Services --> SseS["sse.ts"]
    Services --> StreamS["streamable.ts"]

    Src --> Utils["utils/"]
    Utils --> CallToolU["callTool.ts<br/><i>도구 실행 파이프라인</i>"]
    Utils --> GenerateU["generate.ts<br/><i>차트 생성 (로컬/원격)</i>"]
    Utils --> LocalR["local-renderer.ts<br/><i>로컬 렌더링 엔진</i>"]
    Utils --> EnvU["env.ts<br/><i>환경 변수 관리</i>"]
    Utils --> ValidatorU["validator.ts<br/><i>커스텀 검증</i>"]
    Utils --> LoggerU["logger.ts<br/><i>통합 로깅</i>"]
    Utils --> SchemaU["schema.ts<br/><i>Zod → JSON Schema</i>"]

    Src --> ChartsDir["charts/"]
    ChartsDir --> BaseC["base.ts<br/><i>공통 스키마</i>"]
    ChartsDir --> ChartFiles["*.ts × 31<br/><i>개별 차트 정의</i>"]
    ChartsDir --> ChartIndex["index.ts<br/><i>전체 export</i>"]

    Examples --> AgentDir["chart-agent/"]
    AgentDir --> AgentTS["agent.ts"]

    style Root fill:#f5f5f5,stroke:#616161
    style Src fill:#e3f2fd,stroke:#1565c0
    style Services fill:#fff3e0,stroke:#ff9800
    style Utils fill:#fce4ec,stroke:#e91e63
    style ChartsDir fill:#e8f5e9,stroke:#4caf50
    style Examples fill:#f3e5f5,stroke:#9c27b0
```

## 환경 변수 구성도

```mermaid
graph LR
    subgraph Rendering_Config["렌더링 설정"]
        VRS["VIS_REQUEST_SERVER<br/><i>원격 API URL</i>"]
        ULR["USE_LOCAL_RENDERER<br/><i>기본: true</i>"]
        OD["OUTPUT_DIR<br/><i>기본: ./output</i>"]
    end

    subgraph Tool_Config["도구 설정"]
        DT["DISABLED_TOOLS<br/><i>기본: 지도 6종</i>"]
        SID["SERVICE_ID<br/><i>생성 기록용</i>"]
    end

    subgraph Map_Config["지도 API 키"]
        KAKAO["KAKAO_MAP_API_KEY"]
        NID["NAVER_MAP_CLIENT_ID"]
        NS["NAVER_MAP_CLIENT_SECRET"]
    end

    subgraph Locale_Config["로케일"]
        LOC["LOCALE<br/><i>기본: en</i>"]
    end

    VRS --> RemoteAPI["원격 차트 생성"]
    ULR --> LocalDec["로컬 렌더링 결정"]
    OD --> FileOut["PNG 파일 저장 위치"]
    DT --> ToolFilter["도구 필터링"]
    SID --> MapRecord["지도 생성 기록"]
    KAKAO --> KoreaMap["한국 지도"]
    NID --> KoreaMap
    NS --> KoreaMap
    LOC --> I18N["다국어 지원"]

    style Rendering_Config fill:#e3f2fd,stroke:#1565c0
    style Tool_Config fill:#fff3e0,stroke:#ff9800
    style Map_Config fill:#e8f5e9,stroke:#4caf50
    style Locale_Config fill:#f3e5f5,stroke:#9c27b0
```

---

<a id="english"></a>

## English

# System Architecture Overview

Complete system architecture of MCP Server Chart, showing the full structure from client to chart output.

```mermaid
graph TB
    subgraph Clients["Clients"]
        Claude["Claude Desktop"]
        Cursor["Cursor / VSCode"]
        Cline["Cline"]
        Cherry["Cherry Studio"]
        Agent["Custom Agent"]
    end

    subgraph Transport["Transport Layer"]
        STDIO["Stdio Transport<br/>stdin/stdout"]
        SSE["SSE Transport<br/>GET /sse · POST /messages"]
        HTTP["Streamable HTTP<br/>POST /mcp"]
    end

    subgraph Server["MCP Server Core"]
        MCPServer["MCP Server Instance<br/><i>@modelcontextprotocol/sdk</i>"]
        ListTools["ListToolsRequest<br/>Return tool list"]
        CallTool["CallToolRequest<br/>Route to tool handler"]
        ToolCache["Tool Cache<br/><i>getEnabledTools()</i>"]
        SchemaCache["Schema Cache<br/><i>COMPILED_SCHEMA_CACHE</i>"]
    end

    subgraph Charts["Chart Definitions (32 types)"]
        Basic["Basic Charts (16)<br/>area, bar, column, line, pie,<br/>scatter, radar, funnel, sankey,<br/>histogram, boxplot, violin,<br/>liquid, treemap, dual-axes,<br/>waterfall"]
        Diagram["Diagrams (7)<br/>fishbone, flow, mind-map,<br/>network, org-chart,<br/>venn, word-cloud"]
        Table["Data Table (1)<br/>spreadsheet"]
        MapCN["China Maps (3)<br/>district, path, pin"]
        MapKR["Korea Maps (3)<br/>korea-district,<br/>korea-path, korea-pin"]
        BaseSchema["Base Schema<br/>theme, width, height,<br/>title, texture, palette"]
    end

    subgraph Rendering["Rendering Engine"]
        Validator["Zod Validation<br/>Input schema check"]
        LocalRenderer["Local Renderer<br/><i>@antv/gpt-vis-ssr</i><br/>24 types supported"]
        CustomRenderer["Custom Renderer<br/>waterfall · spreadsheet<br/><i>@antv/g2-ssr</i>"]
        RemoteAPI["Remote API<br/><i>VIS_REQUEST_SERVER</i>"]
        MapAPI["Map Service<br/>AMap · Kakao · Naver"]
    end

    subgraph Output["Output"]
        PNG["PNG File<br/><i>OUTPUT_DIR</i>"]
        URL["Image URL<br/><i>from remote server</i>"]
        Meta["Metadata<br/>spec · description"]
    end

    Clients --> Transport
    STDIO --> MCPServer
    SSE --> MCPServer
    HTTP --> MCPServer
    MCPServer --> ListTools
    MCPServer --> CallTool
    ListTools --> ToolCache
    ToolCache --> Charts
    CallTool --> SchemaCache
    SchemaCache --> Validator
    Validator --> LocalRenderer
    Validator --> RemoteAPI
    Validator --> MapAPI
    LocalRenderer --> PNG
    CustomRenderer --> PNG
    LocalRenderer -.->|"unsupported type"| RemoteAPI
    RemoteAPI --> URL
    MapAPI --> URL
    PNG --> Meta
    URL --> Meta
    Meta --> MCPServer
    BaseSchema --> Basic
    BaseSchema --> Diagram

    style Clients fill:#e8f4fd,stroke:#2196f3
    style Transport fill:#fff3e0,stroke:#ff9800
    style Server fill:#f3e5f5,stroke:#9c27b0
    style Charts fill:#e8f5e9,stroke:#4caf50
    style Rendering fill:#fce4ec,stroke:#e91e63
    style Output fill:#fff9c4,stroke:#ffc107
```

## Request Lifecycle

Complete flow when a client requests chart generation.

```mermaid
sequenceDiagram
    actor Client as Client
    participant Transport as Transport Layer
    participant Server as MCP Server
    participant Handler as Tool Handler
    participant Validator as Zod Validator
    participant Router as Rendering Router
    participant Local as Local Renderer
    participant Remote as Remote API

    Client->>Transport: CallToolRequest<br/>{name, arguments}
    Transport->>Server: Forward JSON-RPC message

    Server->>Handler: callTool(name, args)
    Handler->>Handler: Map tool name → chart type<br/>generate_bar_chart → "bar"

    Handler->>Validator: schema.safeParse(args)

    alt Validation Failed
        Validator-->>Handler: ValidationError
        Handler-->>Client: McpError(InvalidParams)
    end

    Validator-->>Handler: Validation Success

    alt Map Chart (6 types)
        Handler->>Remote: generateMap(tool, input)
        Remote-->>Handler: {metadata, content}
    else Regular Chart (26 types)
        Handler->>Router: generateChartUrl(type, options)

        alt Local Rendering Available (24 types)
            Router->>Local: generateLocalChart(type, options)
            Local->>Local: gpt-vis-ssr render()<br/>or Custom renderer
            Local->>Local: Save PNG file
            Local-->>Router: Return file path
        else Local Unsupported or Disabled
            Router->>Remote: HTTP POST<br/>{type, ...options}
            Remote-->>Router: Return image URL
        end

        Router-->>Handler: URL or file path
    end

    Handler-->>Server: {content, _meta: {spec}}
    Server-->>Transport: JSON-RPC response
    Transport-->>Client: Chart result
```

## Rendering Decision Tree

Decision flow for local vs. remote rendering when generating a chart.

```mermaid
flowchart TD
    Start["generateChartUrl(type, options)"] --> IsMap{Map chart?}

    IsMap -->|Yes| MapAPI["generateMap()<br/>→ Remote map API call"]
    MapAPI --> MapResult["Map image URL + metadata"]

    IsMap -->|No| CheckLocal{USE_LOCAL_RENDERER<br/>= true?}

    CheckLocal -->|No| RemoteOnly["Remote API call<br/>VIS_REQUEST_SERVER"]
    RemoteOnly --> RemoteURL["Return image URL"]

    CheckLocal -->|Yes| CheckType{In LOCAL_SUPPORTED_TYPES?}

    CheckType -->|No| Fallback["Fallback to remote API"]
    Fallback --> RemoteURL

    CheckType -->|Yes| CheckCustom{Custom renderer?}

    CheckCustom -->|"waterfall"| WaterfallR["G2-SSR<br/>Custom waterfall chart"]
    CheckCustom -->|"spreadsheet"| SpreadR["G2-SSR<br/>Heatmap/table"]
    CheckCustom -->|"Other 22 types"| GptVis["gpt-vis-ssr<br/>render()"]

    WaterfallR --> SavePNG["Save PNG<br/>OUTPUT_DIR/{type}-{timestamp}.png"]
    SpreadR --> SavePNG
    GptVis --> SavePNG

    SavePNG --> FilePath["Return absolute file path"]

    style Start fill:#e1f5fe,stroke:#0288d1
    style MapResult fill:#fff9c4,stroke:#f9a825
    style RemoteURL fill:#fff9c4,stroke:#f9a825
    style FilePath fill:#c8e6c9,stroke:#388e3c
    style MapAPI fill:#ffccbc,stroke:#e64a19
    style Fallback fill:#ffccbc,stroke:#e64a19
    style RemoteOnly fill:#ffccbc,stroke:#e64a19
```

## Transport Protocol Comparison

Connection and communication flow for the three transport protocols.

```mermaid
graph LR
    subgraph STDIO["Stdio Transport"]
        direction TB
        C1["Client"] -->|"stdin"| P1["MCP Server<br/>(child process)"]
        P1 -->|"stdout"| C1
        P1 -->|"logs"| STDERR["stderr"]
    end

    subgraph SSE_T["SSE Transport"]
        direction TB
        C2["Client"] -->|"GET /sse"| SSE_S["Express Server<br/>:1122"]
        SSE_S -->|"SSE Stream<br/>(sessionId)"| C2
        C2 -->|"POST /messages<br/>?sessionId=X"| SSE_S
        SSE_S --> CONN["connections<br/>{sessionId: transport}"]
    end

    subgraph HTTP_T["Streamable HTTP"]
        direction TB
        C3["Client"] -->|"POST /mcp"| HTTP_S["Express Server<br/>:1122"]
        HTTP_S -->|"JSON response<br/>or SSE Stream"| C3
        HTTP_S --> CORS["CORS<br/>Mcp-Session-Id"]
    end

    style STDIO fill:#e3f2fd,stroke:#1565c0
    style SSE_T fill:#fff8e1,stroke:#f9a825
    style HTTP_T fill:#f1f8e9,stroke:#558b2f
```

## Agent Integration Example

Communication flow between the example agent (`examples/chart-agent/`) and MCP server.

```mermaid
sequenceDiagram
    actor User as User
    participant Agent as Chart Agent
    participant MCP as MCP Client<br/>(StdioClientTransport)
    participant Server as MCP Server<br/>(child process)
    participant LLM as LLM<br/>(OpenAI/LM Studio)

    User->>Agent: Input chart request

    Note over Agent,Server: Initialization (once)
    Agent->>Server: Start MCP server process<br/>via StdioClientTransport
    Agent->>MCP: client.connect(transport)
    Agent->>MCP: client.listTools()
    MCP-->>Agent: Available tool list

    Note over Agent,LLM: Chart generation loop
    Agent->>LLM: User message +<br/>tool definitions
    LLM-->>Agent: tool_calls response<br/>{name, arguments}

    loop Tool Calls (max 5 iterations)
        Agent->>MCP: client.callTool(name, args)
        MCP->>Server: CallToolRequest
        Server-->>MCP: Chart result (file path)
        MCP-->>Agent: Tool execution result
        Agent->>LLM: Feed back result
        LLM-->>Agent: Final response or next tool_call
    end

    Agent->>Agent: openFile() - Open chart image
    Agent-->>User: Completion message + chart display
```
