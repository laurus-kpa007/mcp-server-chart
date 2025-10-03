import process from "node:process";

/**
 * Get the VIS_REQUEST_SERVER from environment variables.
 */
export function getVisRequestServer() {
  return (
    process.env.VIS_REQUEST_SERVER ||
    "https://antv-studio.alipay.com/api/gpt-vis"
  );
}

/**
 * Get the `SERVICE_ID` from environment variables.
 */
export function getServiceIdentifier() {
  return process.env.SERVICE_ID;
}

/**
 * Get the list of disabled tools from environment variables.
 */
export function getDisabledTools(): string[] {
  const disabledTools = process.env.DISABLED_TOOLS;
  if (!disabledTools || disabledTools === "undefined") {
    return [];
  }
  return disabledTools.split(",");
}

/**
 * Get the locale from environment variables.
 */
export function getLocale(): string {
  return process.env.LOCALE || process.env.LANG || "en";
}

/**
 * Get Kakao Maps API key from environment variables.
 */
export function getKakaoMapApiKey(): string | undefined {
  return process.env.KAKAO_MAP_API_KEY;
}

/**
 * Get Naver Maps API key from environment variables.
 */
export function getNaverMapApiKey(): string | undefined {
  return process.env.NAVER_MAP_CLIENT_ID;
}

/**
 * Get Naver Maps API secret from environment variables.
 */
export function getNaverMapApiSecret(): string | undefined {
  return process.env.NAVER_MAP_CLIENT_SECRET;
}

/**
 * Get whether to use local renderer from environment variables.
 */
export function useLocalRenderer(): boolean {
  return process.env.USE_LOCAL_RENDERER === "true";
}

/**
 * Get the output directory for locally generated charts.
 */
export function getOutputDir(): string {
  return process.env.OUTPUT_DIR || "./output";
}
