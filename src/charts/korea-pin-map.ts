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
    '한국어 관심 지점(POI) 이름의 키워드 목록입니다. POI는 일반적으로 비슷한 위치의 장소 그룹을 포함하므로, 이름은 더 설명적이어야 하며, 같은 지역의 다른 장소임을 나타내기 위해 수식어를 추가해야 합니다. 예: "서울"보다는 "서울특별시", "남산"보다는 "서울 남산타워". 또한 여러 지역에 나타날 수 있는 위치라면 더 구체적으로 지정할 수 있습니다. 예: "롯데월드"보다는 "서울 잠실 롯데월드". 이 도구는 이러한 키워드를 사용하여 특정 POI를 검색하고 위도, 경도, 위치 사진 등의 상세 데이터를 조회합니다. 예: ["서울 남산타워", "서울 경복궁", "서울 명동성당"].',
  );

const schema = {
  title: MapTitleSchema,
  data: KoreaPOIsSchema,
  markerPopup: z
    .object({
      type: z.string().default("image").describe('"image"여야 합니다.'),
      width: z.number().default(40).describe("사진 너비."),
      height: z.number().default(40).describe("사진 높이."),
      borderRadius: z
        .number()
        .default(8)
        .describe("사진 테두리 반경."),
    })
    .optional()
    .describe(
      "마커 유형, 하나는 단순 모드로 아이콘만 표시하며 `markerPopup` 설정이 필요하지 않습니다. 다른 하나는 이미지 모드로 위치 사진을 표시하며 `markerPopup` 설정이 필요합니다. `width`/`height`/`borderRadius`를 조합하여 직사각형 사진과 정사각형 사진을 구현할 수 있습니다. 또한 `borderRadius`가 너비와 높이의 절반일 때 원형 사진도 가능합니다.",
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
  name: "generate_korea_pin_map",
  description:
    "한국 지점 지도를 생성하여 지도에서 지점 데이터의 위치와 분포를 표시합니다. 예: 관광 명소, 병원, 마트 등의 위치 분포.",
  inputSchema: zodToJsonSchema(schema),
};

export const koreaPinMap = {
  schema,
  tool,
};
