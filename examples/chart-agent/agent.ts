#!/usr/bin/env tsx
/**
 * MCP Chart Agent - Interactive CLI client
 *
 * Uses LM Studio (Gemma3:4b) as the LLM backend and
 * mcp-server-chart as the MCP tool server for chart generation.
 *
 * Usage:
 *   npx tsx agent.ts
 *   npx tsx agent.ts --lm-url http://localhost:1234/v1
 */

import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ───────────────────────────────────────────────
const LM_STUDIO_URL = process.argv.includes("--lm-url")
  ? process.argv[process.argv.indexOf("--lm-url") + 1]
  : "http://70.30.171.45:1234/v1";

const LM_MODEL = process.argv.includes("--model")
  ? process.argv[process.argv.indexOf("--model") + 1]
  : "gemma-3-4b-it";

const MCP_SERVER_PATH = path.resolve(
  __dirname,
  "../../build/index.js",
);

// ─── 프리셋 차트 예제 ──────────────────────────────────────────────
const PRESETS = [
  {
    name: "꺾은선 차트 - 월별 매출",
    prompt:
      '"2026년 월별 매출" 제목으로 꺾은선 차트를 생성해줘. 데이터: 1월=120, 2월=150, 3월=180, 4월=210, 5월=250, 6월=230, 7월=280, 8월=310, 9월=290, 10월=320, 11월=350, 12월=400',
  },
  {
    name: "막대 차트 - 프로그래밍 언어",
    prompt:
      '"프로그래밍 언어 인기도" 제목으로 막대 차트를 생성해줘. 데이터: Python=35, JavaScript=28, TypeScript=18, Java=15, Go=10, Rust=8',
  },
  {
    name: "원형 차트 - 예산 배분",
    prompt:
      '"2026년 예산 배분" 제목으로 원형 차트를 생성해줘. 카테고리: 마케팅=30, 개발=40, 운영=15, 인사=10, 기타=5',
  },
  {
    name: "영역 차트 - 웹사이트 트래픽",
    prompt:
      '"일별 웹사이트 방문자" 제목으로 영역 차트를 생성해줘. 데이터: 월=1200, 화=1500, 수=1800, 목=2100, 금=2500, 토=1900, 일=1400',
  },
  {
    name: "컬럼 차트 - 분기별 매출",
    prompt:
      '"분기별 매출" 제목으로 컬럼 차트를 생성해줘. 데이터: 1분기=450, 2분기=520, 3분기=610, 4분기=780',
  },
  {
    name: "산점도 - 키 vs 몸무게",
    prompt:
      '"키 대비 몸무게" 제목으로 산점도를 생성해줘. 데이터: (160,55), (165,60), (170,65), (175,70), (180,80), (185,85), (155,50), (168,62), (172,68), (178,75)',
  },
  {
    name: "레이더 차트 - 역량 평가",
    prompt:
      '"개발자 역량 평가" 제목으로 레이더 차트를 생성해줘. 항목: 프론트엔드=85, 백엔드=70, 데이터베이스=60, DevOps=55, 테스트=75, 디자인=40',
  },
  {
    name: "퍼널 차트 - 영업 파이프라인",
    prompt:
      '"영업 파이프라인" 제목으로 퍼널 차트를 생성해줘. 단계: 리드=1000, 검증=600, 제안=350, 협상=200, 계약=120',
  },
  {
    name: "이중축 차트 - 매출 vs 이익률",
    prompt:
      '"매출 대비 이익률" 제목으로 이중축 차트를 생성해줘. 카테고리: 2020,2021,2022,2023,2026. 컬럼: 매출 100,150,200,280,350 (제목: "매출(억)"). 라인: 이익률 0.08,0.10,0.12,0.15,0.18 (제목: "이익률")',
  },
  {
    name: "워터폴 차트 - 손익 분석",
    prompt:
      '"손익 분석" 제목으로 워터폴 차트를 생성해줘. 데이터: 매출=500, 매출원가=-200, 매출총이익=300, 운영비=-150, 세금=-45, 순이익=105',
  },
  {
    name: "생키 차트 - 에너지 흐름",
    prompt:
      '"에너지 흐름" 제목으로 생키 차트를 생성해줘. 흐름: 석탄->전력=100, 가스->전력=80, 태양광->전력=40, 전력->산업=120, 전력->가정=60, 전력->상업=40',
  },
  {
    name: "워드 클라우드 - 기술 키워드",
    prompt:
      '"2026 기술 트렌드" 제목으로 워드 클라우드를 생성해줘. 단어: AI=100, LLM=90, MCP=80, Kubernetes=70, Rust=65, WebAssembly=60, Edge=55, GraphQL=50, Serverless=45, Blockchain=40, IoT=35, 5G=30',
  },
  {
    name: "마인드맵 - 프로젝트 구조",
    prompt:
      '"웹 프로젝트" 제목으로 마인드맵을 생성해줘. 루트 "웹 앱", 하위: "프론트엔드" (하위: "React", "Tailwind"), "백엔드" (하위: "Node.js", "PostgreSQL"), "DevOps" (하위: "Docker", "CI/CD")',
  },
  {
    name: "조직도 - 회사 구조",
    prompt:
      '"회사 조직도" 제목으로 조직도를 생성해줘. 최상위 CEO, 하위: CTO (하위: VP Engineering과 Dev Lead, VP Product), CFO (하위: 재무이사), COO (하위: 운영팀장)',
  },
  {
    name: "스프레드시트 - 학생 성적표",
    prompt:
      '"학생 성적표" 제목으로 스프레드시트를 생성해줘. 데이터: 김철수 수학=95 영어=88 과학=92, 이영희 수학=78 영어=92 과학=85, 박민수 수학=88 영어=75 과학=90, 최수진 수학=92 영어=95 과학=88',
  },
];

// ─── Colors (simple ANSI) ────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
};

// ─── MCP Client Setup ────────────────────────────────────────────
let mcpClient: Client;
let mcpTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];

async function initMCP(): Promise<void> {
  console.log(`${c.dim}MCP 서버 연결 중: ${MCP_SERVER_PATH}${c.reset}`);

  const transport = new StdioClientTransport({
    command: "node",
    args: [MCP_SERVER_PATH],
    env: {
      ...process.env,
      USE_LOCAL_RENDERER: "true",
      OUTPUT_DIR: path.resolve(__dirname, "./output"),
    },
  });

  mcpClient = new Client({ name: "chart-agent", version: "1.0.0" });
  await mcpClient.connect(transport);

  // Fetch available tools from MCP server
  const { tools } = await mcpClient.listTools();
  console.log(
    `${c.green}연결 완료! ${tools.length}개의 차트 도구 사용 가능.${c.reset}\n`,
  );

  // Convert MCP tools to OpenAI function format
  mcpTools = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.inputSchema as Record<string, unknown>,
    },
  }));
}

// ─── LLM Client ──────────────────────────────────────────────────
const openai = new OpenAI({
  baseURL: LM_STUDIO_URL,
  apiKey: "lm-studio",
});

const SYSTEM_PROMPT = `당신은 차트 생성 어시스턴트입니다. 사용자가 차트를 요청하면 적절한 도구를 사용하여 생성하세요. 응답은 한국어로 해주세요.

중요 규칙:
1. 항상 적절한 차트 생성 도구를 올바른 형식의 데이터로 호출하세요.
2. 데이터 배열은 요구되는 스키마 형식에 맞게 변환하세요.
3. 항상 차트에 설명적인 제목을 설정하세요.
4. 차트 생성 후 파일 경로를 사용자에게 알려주세요.

차트 데이터 형식 예시:
- 꺾은선/영역: data: [{time: "라벨", value: 숫자}]
- 막대/컬럼: data: [{category: "라벨", value: 숫자}]
- 원형: data: [{category: "라벨", value: 숫자}]
- 산점도: data: [{x: 숫자, y: 숫자}]
- 레이더: data: [{name: "라벨", value: 숫자}]
- 퍼널: data: [{category: "라벨", value: 숫자}]
- 이중축: categories: ["a","b"], series: [{type:"column", data:[1,2], axisYTitle:"Y1"}, {type:"line", data:[0.1,0.2], axisYTitle:"Y2"}]
- 워터폴: data: [{category: "라벨", value: 숫자}]
- 생키: data: [{source: "출발", target: "도착", value: 숫자}]
- 워드클라우드: data: [{text: "단어", value: 숫자}]
- 마인드맵: data: {name: "루트", children: [{name: "자식"}]}
- 조직도: data: {name: "루트", children: [{name: "자식"}]}
- 스프레드시트: data: [{키1: 값1, 키2: 값2}]
- 리퀴드: percent: 0.75
- 히스토그램: data: [숫자, 숫자, ...]
- 박스플롯/바이올린: data: [{category: "라벨", value: 숫자}]
- 벤: data: [{sets: ["A"], value: 10}, {sets: ["A","B"], value: 5}]
- 트리맵: data: [{name: "라벨", value: 숫자, children: [...]}]
- 플로우 다이어그램: data: {nodes: [{name: "n"}], edges: [{source: "a", target: "b", name: "e"}]}
- 네트워크 그래프: data: {nodes: [{name: "n"}], edges: [{source: "a", target: "b", name: "e"}]}
- 피시본 다이어그램: data: {name: "문제", children: [{name: "원인", children: [{name: "세부"}]}]}`;

async function chatWithLLM(userMessage: string): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  // First call - LLM may request tool use
  let response = await openai.chat.completions.create({
    model: LM_MODEL,
    messages,
    tools: mcpTools,
    tool_choice: "auto",
  });

  let assistantMessage = response.choices[0].message;

  // Tool call loop (max 5 iterations to prevent infinite loops)
  let iterations = 0;
  while (assistantMessage.tool_calls && iterations < 5) {
    iterations++;
    messages.push(assistantMessage);

    // Execute each tool call via MCP
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let toolArgs: Record<string, unknown>;

      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = {};
      }

      console.log(`${c.magenta}  도구 호출 중: ${toolName}${c.reset}`);

      try {
        const result = await mcpClient.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        const resultText = (result.content as any[])
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("\n");

        // If it's a file path, try to open it
        if (
          resultText &&
          (resultText.endsWith(".png") || resultText.includes("output"))
        ) {
          console.log(`${c.green}  차트 생성 완료: ${resultText}${c.reset}`);
          openFile(resultText);
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: resultText || "차트가 성공적으로 생성되었습니다.",
        });
      } catch (error: any) {
        console.log(`${c.red}  도구 오류: ${error.message}${c.reset}`);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Error: ${error.message}`,
        });
      }
    }

    // Get next response from LLM
    response = await openai.chat.completions.create({
      model: LM_MODEL,
      messages,
      tools: mcpTools,
      tool_choice: "auto",
    });

    assistantMessage = response.choices[0].message;
  }

  return assistantMessage.content || "(응답 없음)";
}

// ─── File Opener ─────────────────────────────────────────────────
function openFile(filePath: string): void {
  const cmd =
    process.platform === "win32"
      ? `start "" "${filePath}"`
      : process.platform === "darwin"
        ? `open "${filePath}"`
        : `xdg-open "${filePath}"`;

  exec(cmd, (err) => {
    if (err) {
      console.log(`${c.dim}  (파일을 자동으로 열 수 없습니다)${c.reset}`);
    }
  });
}

// ─── 메뉴 표시 ──────────────────────────────────────────────────
function showMenu(): void {
  console.log(
    `${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`,
  );
  console.log(
    `${c.bold}${c.cyan}║        MCP 차트 에이전트 - 인터랙티브 CLI                ║${c.reset}`,
  );
  console.log(
    `${c.bold}${c.cyan}╠══════════════════════════════════════════════════════════╣${c.reset}`,
  );
  console.log(
    `${c.cyan}║${c.reset} LLM: ${c.yellow}${LM_MODEL}${c.reset} @ ${c.dim}${LM_STUDIO_URL}${c.reset}`,
  );
  console.log(
    `${c.bold}${c.cyan}╠══════════════════════════════════════════════════════════╣${c.reset}`,
  );
  console.log(`${c.cyan}║${c.reset} ${c.bold}프리셋 차트:${c.reset}`);

  PRESETS.forEach((preset, i) => {
    const num = String(i + 1).padStart(2, " ");
    console.log(
      `${c.cyan}║${c.reset}  ${c.green}${num}${c.reset}. ${preset.name}`,
    );
  });

  console.log(
    `${c.bold}${c.cyan}╠══════════════════════════════════════════════════════════╣${c.reset}`,
  );
  console.log(
    `${c.cyan}║${c.reset} ${c.bold}번호${c.reset}를 입력하면 프리셋 차트, ${c.bold}프롬프트${c.reset}를 입력하면 커스텀 차트`,
  );
  console.log(
    `${c.cyan}║${c.reset} ${c.yellow}menu${c.reset} 메뉴 표시, ${c.yellow}quit${c.reset} 종료`,
  );
  console.log(
    `${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`,
  );
  console.log();
}

// ─── 직접 실행 (LLM 없이도 가능) ─────────────────────────────────
async function directExecute(presetIndex: number): Promise<void> {
  const preset = PRESETS[presetIndex];
  console.log(`\n${c.blue}프리셋: ${preset.name}${c.reset}`);
  console.log(`${c.dim}LLM에 전송 중...${c.reset}`);

  try {
    const reply = await chatWithLLM(preset.prompt);
    console.log(`\n${c.green}${c.bold}어시스턴트:${c.reset} ${reply}\n`);
  } catch (error: any) {
    // LLM을 사용할 수 없으면 MCP 도구를 직접 호출
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("Connection") ||
      error.message?.includes("fetch")
    ) {
      console.log(
        `${c.yellow}LLM을 사용할 수 없습니다. MCP를 통해 직접 차트를 생성합니다...${c.reset}`,
      );
      await directChartCall(presetIndex);
    } else {
      console.log(`${c.red}오류: ${error.message}${c.reset}\n`);
    }
  }
}

// 폴백: LLM 없이 차트를 직접 생성
async function directChartCall(presetIndex: number): Promise<void> {
  // 프리셋 인덱스별 직접 도구 호출 매핑
  const directCalls: Record<number, { tool: string; args: object }> = {
    0: {
      tool: "generate_line_chart",
      args: {
        data: [
          { time: "Jan", value: 120 },
          { time: "Feb", value: 150 },
          { time: "Mar", value: 180 },
          { time: "Apr", value: 210 },
          { time: "May", value: 250 },
          { time: "Jun", value: 230 },
          { time: "Jul", value: 280 },
          { time: "Aug", value: 310 },
          { time: "Sep", value: 290 },
          { time: "Oct", value: 320 },
          { time: "Nov", value: 350 },
          { time: "Dec", value: 400 },
        ],
        title: "2026년 월별 매출",
      },
    },
    1: {
      tool: "generate_bar_chart",
      args: {
        data: [
          { category: "Python", value: 35 },
          { category: "JavaScript", value: 28 },
          { category: "TypeScript", value: 18 },
          { category: "Java", value: 15 },
          { category: "Go", value: 10 },
          { category: "Rust", value: 8 },
        ],
        title: "프로그래밍 언어 인기도",
      },
    },
    2: {
      tool: "generate_pie_chart",
      args: {
        data: [
          { category: "마케팅", value: 30 },
          { category: "개발", value: 40 },
          { category: "운영", value: 15 },
          { category: "인사", value: 10 },
          { category: "기타", value: 5 },
        ],
        title: "2026년 예산 배분",
      },
    },
    3: {
      tool: "generate_area_chart",
      args: {
        data: [
          { time: "월", value: 1200 },
          { time: "화", value: 1500 },
          { time: "수", value: 1800 },
          { time: "목", value: 2100 },
          { time: "금", value: 2500 },
          { time: "토", value: 1900 },
          { time: "일", value: 1400 },
        ],
        title: "일별 웹사이트 방문자",
      },
    },
    4: {
      tool: "generate_column_chart",
      args: {
        data: [
          { category: "Q1", value: 450 },
          { category: "Q2", value: 520 },
          { category: "Q3", value: 610 },
          { category: "Q4", value: 780 },
        ],
        title: "분기별 매출",
      },
    },
    5: {
      tool: "generate_scatter_chart",
      args: {
        data: [
          { x: 160, y: 55 },
          { x: 165, y: 60 },
          { x: 170, y: 65 },
          { x: 175, y: 70 },
          { x: 180, y: 80 },
          { x: 185, y: 85 },
          { x: 155, y: 50 },
          { x: 168, y: 62 },
          { x: 172, y: 68 },
          { x: 178, y: 75 },
        ],
        title: "키 대비 몸무게",
      },
    },
    6: {
      tool: "generate_radar_chart",
      args: {
        data: [
          { name: "프론트엔드", value: 85 },
          { name: "백엔드", value: 70 },
          { name: "데이터베이스", value: 60 },
          { name: "DevOps", value: 55 },
          { name: "테스트", value: 75 },
          { name: "디자인", value: 40 },
        ],
        title: "개발자 역량 평가",
      },
    },
    7: {
      tool: "generate_funnel_chart",
      args: {
        data: [
          { category: "리드", value: 1000 },
          { category: "검증", value: 600 },
          { category: "제안", value: 350 },
          { category: "협상", value: 200 },
          { category: "계약", value: 120 },
        ],
        title: "영업 파이프라인",
      },
    },
    8: {
      tool: "generate_dual_axes_chart",
      args: {
        categories: ["2020", "2021", "2022", "2023", "2026"],
        series: [
          {
            type: "column",
            data: [100, 150, 200, 280, 350],
            axisYTitle: "매출(억)",
          },
          {
            type: "line",
            data: [0.08, 0.1, 0.12, 0.15, 0.18],
            axisYTitle: "이익률",
          },
        ],
        title: "매출 대비 이익률",
      },
    },
    9: {
      tool: "generate_waterfall_chart",
      args: {
        data: [
          { category: "매출", value: 500 },
          { category: "매출원가", value: -200 },
          { category: "매출총이익", value: 300 },
          { category: "운영비", value: -150 },
          { category: "세금", value: -45 },
          { category: "순이익", value: 105 },
        ],
        title: "손익 분석",
      },
    },
    10: {
      tool: "generate_sankey_chart",
      args: {
        data: [
          { source: "석탄", target: "전력", value: 100 },
          { source: "가스", target: "전력", value: 80 },
          { source: "태양광", target: "전력", value: 40 },
          { source: "전력", target: "산업", value: 120 },
          { source: "전력", target: "가정", value: 60 },
          { source: "전력", target: "상업", value: 40 },
        ],
        title: "에너지 흐름",
      },
    },
    11: {
      tool: "generate_word_cloud_chart",
      args: {
        data: [
          { text: "AI", value: 100 },
          { text: "LLM", value: 90 },
          { text: "MCP", value: 80 },
          { text: "Kubernetes", value: 70 },
          { text: "Rust", value: 65 },
          { text: "WebAssembly", value: 60 },
          { text: "Edge", value: 55 },
          { text: "GraphQL", value: 50 },
          { text: "Serverless", value: 45 },
          { text: "Blockchain", value: 40 },
          { text: "IoT", value: 35 },
          { text: "5G", value: 30 },
        ],
        title: "2026 기술 트렌드",
      },
    },
    12: {
      tool: "generate_mind_map",
      args: {
        data: {
          name: "웹 앱",
          children: [
            {
              name: "프론트엔드",
              children: [{ name: "React" }, { name: "Tailwind" }],
            },
            {
              name: "백엔드",
              children: [{ name: "Node.js" }, { name: "PostgreSQL" }],
            },
            {
              name: "DevOps",
              children: [{ name: "Docker" }, { name: "CI/CD" }],
            },
          ],
        },
        title: "웹 프로젝트",
      },
    },
    13: {
      tool: "generate_organization_chart",
      args: {
        data: {
          name: "CEO",
          children: [
            {
              name: "CTO",
              children: [
                { name: "기술부사장", children: [{ name: "개발팀장" }] },
                { name: "제품부사장" },
              ],
            },
            { name: "CFO", children: [{ name: "재무이사" }] },
            { name: "COO", children: [{ name: "운영팀장" }] },
          ],
        },
        title: "회사 조직도",
      },
    },
    14: {
      tool: "generate_spreadsheet",
      args: {
        data: [
          { name: "김철수", math: 95, english: 88, science: 92 },
          { name: "이영희", math: 78, english: 92, science: 85 },
          { name: "박민수", math: 88, english: 75, science: 90 },
          { name: "최수진", math: 92, english: 95, science: 88 },
        ],
        title: "학생 성적표",
      },
    },
  };

  const call = directCalls[presetIndex];
  if (!call) {
    console.log(
      `${c.red}이 프리셋에 대한 직접 호출이 정의되지 않았습니다.${c.reset}\n`,
    );
    return;
  }

  console.log(`${c.magenta}  도구 호출 중: ${call.tool}${c.reset}`);

  try {
    const result = await mcpClient.callTool({
      name: call.tool,
      arguments: call.args as Record<string, unknown>,
    });

    const resultText = (result.content as any[])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n");

    if (resultText) {
      console.log(`${c.green}  차트 생성 완료: ${resultText}${c.reset}`);
      openFile(resultText);
    }

    console.log(
      `\n${c.green}${c.bold}완료!${c.reset} 차트가 생성되어 열렸습니다.\n`,
    );
  } catch (error: any) {
    console.log(`${c.red}오류: ${error.message}${c.reset}\n`);
  }
}

// ─── Main Loop ───────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log(`\n${c.dim}MCP 차트 에이전트 초기화 중...${c.reset}\n`);

  try {
    await initMCP();
  } catch (error: any) {
    console.error(`${c.red}MCP 서버 연결 실패: ${error.message}${c.reset}`);
    console.error(
      `${c.dim}먼저 프로젝트를 빌드하세요: npm run build${c.reset}`,
    );
    process.exit(1);
  }

  showMenu();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question(`${c.cyan}> ${c.reset}`, async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (
        trimmed.toLowerCase() === "quit" ||
        trimmed.toLowerCase() === "exit" ||
        trimmed === "종료"
      ) {
        console.log(`${c.dim}안녕히 가세요!${c.reset}`);
        await mcpClient.close();
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === "menu" || trimmed === "메뉴") {
        showMenu();
        prompt();
        return;
      }

      // Check if it's a preset number
      const num = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= PRESETS.length) {
        await directExecute(num - 1);
        prompt();
        return;
      }

      // 커스텀 프롬프트
      console.log(`${c.dim}LLM에 전송 중...${c.reset}`);
      try {
        const reply = await chatWithLLM(trimmed);
        console.log(`\n${c.green}${c.bold}어시스턴트:${c.reset} ${reply}\n`);
      } catch (error: any) {
        if (
          error.code === "ECONNREFUSED" ||
          error.message?.includes("Connection") ||
          error.message?.includes("fetch")
        ) {
          console.log(
            `${c.red}LLM을 사용할 수 없습니다: ${LM_STUDIO_URL}${c.reset}`,
          );
          console.log(
            `${c.yellow}팁: 프리셋 번호(1-${PRESETS.length})를 입력하면 LLM 없이 차트를 생성할 수 있습니다${c.reset}\n`,
          );
        } else {
          console.log(`${c.red}오류: ${error.message}${c.reset}\n`);
        }
      }
      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
