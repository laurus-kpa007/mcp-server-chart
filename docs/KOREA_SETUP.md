# 한국 지도 설정 가이드

이 문서는 MCP Server Chart에서 한국 지도 기능을 사용하기 위한 설정 가이드입니다.

## 목차

- [지원하는 지도 서비스](#지원하는-지도-서비스)
- [Kakao Maps 설정](#kakao-maps-설정)
- [Naver Maps 설정](#naver-maps-설정)
- [사용 가능한 한국 지도 도구](#사용-가능한-한국-지도-도구)
- [사용 예시](#사용-예시)

## 지원하는 지도 서비스

한국 지도 기능은 다음 지도 서비스를 지원합니다:

- **Kakao Maps** (기본값)
- **Naver Maps**

## Kakao Maps 설정

### 1. API 키 발급

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 로그인 후 "내 애플리케이션" 선택
3. "애플리케이션 추가하기" 클릭
4. 앱 이름 입력 후 저장
5. 생성된 앱에서 "JavaScript 키" 또는 "REST API 키" 복사

### 2. 플랫폼 등록

1. 앱 설정 > 플랫폼 > Web 플랫폼 등록
2. 사이트 도메인 입력 (로컬 개발: `http://localhost`)

### 3. 환경 변수 설정

**Claude Desktop (Mac):**

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "KAKAO_MAP_API_KEY": "your-kakao-api-key-here",
        "LOCALE": "ko"
      }
    }
  }
}
```

**Claude Desktop (Windows):**

`%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@antv/mcp-server-chart"],
      "env": {
        "KAKAO_MAP_API_KEY": "your-kakao-api-key-here",
        "LOCALE": "ko"
      }
    }
  }
}
```

## Naver Maps 설정

### 1. API 키 발급

1. [Naver Cloud Platform](https://www.ncloud.com/) 접속
2. 로그인 후 콘솔로 이동
3. "Services" > "AI·NAVER API" 선택
4. "Application 등록" 클릭
5. 애플리케이션 이름 입력
6. "Maps" 서비스 선택
7. "Web Dynamic Map" 추가
8. 등록 후 "Client ID"와 "Client Secret" 복사

### 2. 환경 변수 설정

**Claude Desktop (Mac):**

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "NAVER_MAP_CLIENT_ID": "your-naver-client-id",
        "NAVER_MAP_CLIENT_SECRET": "your-naver-client-secret",
        "LOCALE": "ko"
      }
    }
  }
}
```

**Claude Desktop (Windows):**

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@antv/mcp-server-chart"],
      "env": {
        "NAVER_MAP_CLIENT_ID": "your-naver-client-id",
        "NAVER_MAP_CLIENT_SECRET": "your-naver-client-secret",
        "LOCALE": "ko"
      }
    }
  }
}
```

## 사용 가능한 한국 지도 도구

### 1. generate_korea_district_map

한국 행정구역 지도를 생성합니다.

**용도:**
- 시/도별 데이터 분포 시각화
- 시/군/구 단위 통계 표시
- 지역별 비교 분석

**매개변수:**
- `title`: 지도 제목
- `data`: 행정구역 데이터
  - `name`: 행정구역 이름 (예: "대한민국", "서울특별시", "경기도")
  - `dataType`: 데이터 유형 ("number" 또는 "enum")
  - `dataLabel`: 데이터 레이블 (예: "인구", "GDP")
  - `dataValueUnit`: 데이터 단위 (예: "만명", "조원")
  - `subdistricts`: 하위 행정구역 배열
- `mapProvider`: "kakao" 또는 "naver" (기본값: "kakao")

### 2. generate_korea_pin_map

한국 지점 지도를 생성합니다.

**용도:**
- 관광 명소 위치 표시
- 매장/지점 분포 시각화
- POI(Point of Interest) 위치 표시

**매개변수:**
- `title`: 지도 제목
- `data`: 장소 이름 배열 (예: ["서울 남산타워", "서울 경복궁"])
- `markerPopup`: 마커 스타일 설정 (선택사항)
- `mapProvider`: "kakao" 또는 "naver"

### 3. generate_korea_path_map

한국 경로 지도를 생성합니다.

**용도:**
- 여행 경로 시각화
- 배송 경로 표시
- 방문 계획 표시

**매개변수:**
- `title`: 지도 제목
- `data`: 경로 배열 (각 경로는 장소 이름 배열을 포함)
- `mapProvider`: "kakao" 또는 "naver"

## 사용 예시

### 예시 1: 서울 주요 관광지 지도

```json
{
  "title": "서울 주요 관광지",
  "data": [
    "서울 남산타워",
    "서울 경복궁",
    "서울 명동성당",
    "서울 청계천",
    "서울 롯데월드타워"
  ],
  "mapProvider": "kakao"
}
```

### 예시 2: 대한민국 광역시도 인구 분포

```json
{
  "title": "대한민국 광역시도 인구 분포 (2024)",
  "data": {
    "name": "대한민국",
    "showAllSubdistricts": true,
    "dataLabel": "인구",
    "dataType": "number",
    "dataValueUnit": "만명",
    "colors": ["#1783FF"],
    "subdistricts": [
      {"name": "서울특별시", "dataValue": "967"},
      {"name": "부산광역시", "dataValue": "339"},
      {"name": "인천광역시", "dataValue": "296"},
      {"name": "대구광역시", "dataValue": "242"},
      {"name": "광주광역시", "dataValue": "146"},
      {"name": "대전광역시", "dataValue": "147"},
      {"name": "울산광역시", "dataValue": "114"},
      {"name": "세종특별자치시", "dataValue": "38"},
      {"name": "경기도", "dataValue": "1356"},
      {"name": "강원특별자치도", "dataValue": "155"},
      {"name": "충청북도", "dataValue": "160"},
      {"name": "충청남도", "dataValue": "212"},
      {"name": "전북특별자치도", "dataValue": "180"},
      {"name": "전라남도", "dataValue": "185"},
      {"name": "경상북도", "dataValue": "264"},
      {"name": "경상남도", "dataValue": "333"},
      {"name": "제주특별자치도", "dataValue": "68"}
    ]
  },
  "width": 1200,
  "height": 1000,
  "mapProvider": "kakao"
}
```

### 예시 3: 서울 여행 코스

```json
{
  "title": "서울 1일 여행 코스",
  "data": [
    {
      "data": [
        "서울 경복궁",
        "서울 광화문",
        "서울 인사동",
        "서울 청계천",
        "서울 명동"
      ]
    }
  ],
  "mapProvider": "naver"
}
```

### 예시 4: 경기도 시군별 사업체 수

```json
{
  "title": "경기도 시군별 사업체 수",
  "data": {
    "name": "경기도",
    "showAllSubdistricts": true,
    "dataLabel": "사업체",
    "dataType": "number",
    "dataValueUnit": "천개",
    "colors": ["#00C9C9"],
    "subdistricts": [
      {"name": "경기도 수원시", "dataValue": "85"},
      {"name": "경기도 성남시", "dataValue": "78"},
      {"name": "경기도 고양시", "dataValue": "72"},
      {"name": "경기도 용인시", "dataValue": "68"},
      {"name": "경기도 부천시", "dataValue": "55"}
    ]
  },
  "mapProvider": "kakao"
}
```

## 주의사항

1. **행정구역 이름 형식**
   - 정확한 행정구역 이름 사용 (예: "서울특별시", "부산광역시")
   - 시/군/구 단위까지 명시 (예: "경기도 성남시", "서울특별시 강남구")

2. **POI 이름 형식**
   - 구체적인 장소 이름 사용 (예: "서울 남산타워", "부산 해운대해수욕장")
   - 지역명 포함 권장 (예: "남산타워"보다 "서울 남산타워")

3. **API 키 보안**
   - API 키를 공개 저장소에 커밋하지 마세요
   - 환경 변수를 사용하여 API 키 관리

4. **API 사용량 제한**
   - Kakao Maps: 무료 사용량 제한 확인
   - Naver Maps: 플랜별 사용량 제한 확인

## 문제 해결

### API 키 오류

**증상:** "API key is invalid" 또는 "인증 실패" 메시지

**해결방법:**
1. API 키가 올바르게 설정되었는지 확인
2. Kakao/Naver 콘솔에서 API 키 활성화 상태 확인
3. 플랫폼 설정 확인 (도메인 등록)

### 지도가 표시되지 않음

**증상:** 빈 지도 또는 오류 메시지

**해결방법:**
1. 인터넷 연결 확인
2. API 사용량 한도 확인
3. 행정구역/장소 이름 정확성 확인
4. 브라우저 콘솔에서 오류 메시지 확인

### 장소를 찾을 수 없음

**증상:** "POI not found" 메시지

**해결방법:**
1. 장소 이름에 지역명 추가 (예: "남산타워" → "서울 남산타워")
2. 정확한 장소명 사용
3. 다른 지도 제공자 시도 (`mapProvider` 변경)

## 추가 리소스

- [Kakao Maps API 문서](https://apis.map.kakao.com/)
- [Naver Maps API 문서](https://www.ncloud.com/product/applicationService/maps)
- [MCP Server Chart GitHub](https://github.com/antvis/mcp-server-chart)
