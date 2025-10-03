import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  MapHeightSchema,
  MapTitleSchema,
  MapWidthSchema,
} from "./base";

const KoreaPOIsSchema = z
  .array(z.string())
  .nonempty("최소 하나의 장소 이름이 필요합니다.")
  .describe(
    '한국어 관심 지점(POI) 이름의 키워드 목록입니다. 예: ["서울 남산타워", "서울 경복궁", "서울 명동성당"].',
  );

const schema = {
  title: MapTitleSchema,
  data: z
    .array(
      z.object({ data: KoreaPOIsSchema }).describe("경로와 경로상의 장소들."),
    )
    .nonempty("최소 하나의 경로가 필요합니다.")
    .describe(
      '경로, 각 그룹은 한 경로를 따른 모든 POI를 나타냅니다. 예: [{ "data": ["서울 남산타워", "서울 N서울타워", "서울 명동"] }, { "data": ["서울 경복궁", "서울 인사동"] }]',
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
  name: "generate_korea_path_map",
  description:
    "한국 경로 지도를 생성하여 사용자가 계획한 경로를 표시합니다. 예: 여행 가이드 경로.",
  inputSchema: zodToJsonSchema(schema),
};

export const koreaPathMap = {
  schema,
  tool,
};
