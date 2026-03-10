# MCP Chart Agent - Interactive CLI

LM Studio (Gemma3:4b) + MCP Server Chart를 사용한 인터랙티브 차트 생성 에이전트입니다.

## 사전 요구사항

1. **LM Studio** 설치 및 Gemma3:4b 모델 로드
   - LM Studio에서 로컬 서버 시작 (기본: `http://localhost:1234/v1`)

2. **MCP Server Chart** 빌드 완료
   ```bash
   # 프로젝트 루트에서
   npm run build
   ```

## 설치 및 실행

```bash
cd examples/chart-agent
npm install
npx tsx agent.ts
```

## 사용법

### 프리셋 차트 (번호 선택)
숫자를 입력하면 바로 차트가 생성됩니다. LLM 없이도 동작합니다.

```
> 1    # 꺾은선 차트 - 월별 매출
> 5    # 컬럼 차트 - 분기별 매출
> 10   # 워터폴 차트 - 손익 분석
```

### 커스텀 프롬프트
자연어로 차트를 요청합니다. LM Studio가 실행 중이어야 합니다.

```
> 시장 점유율을 원형 차트로 보여줘: 삼성 25%, 애플 20%, 샤오미 15%, 기타 40%
```

### 옵션
```bash
# LM Studio URL 변경
npx tsx agent.ts --lm-url http://localhost:1234/v1

# 모델 변경
npx tsx agent.ts --model gemma-3-4b-it
```

## 명령어
- `menu` 또는 `메뉴` - 메뉴 다시 표시
- `quit` 또는 `종료` - 종료
- `1-15` - 프리셋 차트 생성
- (텍스트) - LLM에 커스텀 프롬프트 전달
