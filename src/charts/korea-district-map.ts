import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import { MapHeightSchema, MapTitleSchema, MapWidthSchema } from "./base";

const KoreaDistrictNameSchema = z
  .string()
  .describe(
    '한국 행정구역의 이름 (대한민국 내 지역만 가능). 시/도, 시/군/구, 읍/면/동 중 하나여야 합니다. 이름은 구체적이고 명확해야 합니다. 예: "서울특별시", "부산광역시", "경기도 성남시", "제주특별자치도". 애매한 이름이나 특정 장소명은 사용할 수 없습니다.',
  );

const StyleSchema = z
  .object({
    fillColor: z
      .string()
      .optional()
      .describe("채우기 색상, rgb 또는 rgba 형식."),
  })
  .optional()
  .describe("스타일 설정.");

const SubDistrictSchema = z.object({
  name: KoreaDistrictNameSchema,
  dataValue: z
    .string()
    .optional()
    .describe("데이터 값, 숫자 문자열 또는 열거형 문자열."),
  style: StyleSchema,
});

const schema = {
  title: MapTitleSchema,
  data: z
    .object({
      name: KoreaDistrictNameSchema,
      style: StyleSchema,
      colors: z
        .array(z.string())
        .default([
          "#1783FF",
          "#00C9C9",
          "#F0884D",
          "#D580FF",
          "#7863FF",
          "#60C42D",
          "#BD8F24",
          "#FF80CA",
          "#2491B3",
          "#17C76F",
        ])
        .optional()
        .describe("데이터 색상 목록, rgb 또는 rgba 형식."),
      dataType: z
        .enum(["number", "enum"])
        .optional()
        .describe("데이터 값의 유형, 숫자형 또는 열거형"),
      dataLabel: z.string().optional().describe('데이터 레이블, 예: "인구"'),
      dataValue: z
        .string()
        .optional()
        .describe("데이터 값, 숫자 문자열 또는 열거형 문자열."),
      dataValueUnit: z
        .string()
        .optional()
        .describe('데이터 단위, 예: "만명"'),
      showAllSubdistricts: z
        .boolean()
        .optional()
        .default(false)
        .describe("모든 하위 행정구역을 표시할지 여부."),
      subdistricts: z
        .array(SubDistrictSchema)
        .optional()
        .describe(
          "하위 행정구역은 지역 구성 또는 관련 데이터의 지역 분포를 표시하는 데 사용됩니다.",
        ),
    })
    .describe(
      '행정 구역 데이터, 하위 행정 구역은 선택사항입니다. 두 가지 시나리오가 있습니다: 1) 단순히 지역 구성을 표시하는 경우 `fillColor`만 설정하면 됩니다. 2) 지역 데이터 분포 시나리오의 경우 먼저 `dataType`, `dataValueUnit`, `dataLabel`을 설정하고, `dataValue`는 의미 있는 값이어야 합니다. 예: {"title": "대한민국 광역시도 인구 분포", "data": {"name": "대한민국", "showAllSubdistricts": true, "dataLabel": "인구", "dataType": "number", "dataValueUnit": "만명", "colors": ["#4ECDC4"], "subdistricts": [{"name": "서울특별시", "dataValue": "967"}, {"name": "부산광역시", "dataValue": "339"}, {"name": "경기도", "dataValue": "1356"}]}, "width": 1000, "height": 1000}.',
    ),
  width: MapWidthSchema,
  height: MapHeightSchema,
  mapProvider: z
    .enum(["kakao", "naver"])
    .optional()
    .default("kakao")
    .describe("지도 제공자 선택 (kakao 또는 naver)."),
};

const tool = {
  name: "generate_korea_district_map",
  description:
    "한국 행정구역 지도를 생성합니다. 대한민국 내 시/도, 시/군/구 단위의 행정구역 분포와 데이터 시각화에 사용됩니다. 예: 시/도별 인구 분포, GDP 분포 등. 대한민국 내 지역만 지원합니다.",
  inputSchema: zodToJsonSchema(schema),
};

export const koreaDistrictMap = {
  schema,
  tool,
};
