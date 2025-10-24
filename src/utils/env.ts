import process from "node:process";

/**
 * Get the VIS_REQUEST_SERVER from environment variables.
 * Note: External server URL should be explicitly set via VIS_REQUEST_SERVER environment variable.
 */
export function getVisRequestServer() {
  if (!process.env.VIS_REQUEST_SERVER) {
    throw new Error(
      "VIS_REQUEST_SERVER environment variable is required when USE_LOCAL_RENDERER is not enabled. " +
        "Please set VIS_REQUEST_SERVER to your chart generation service URL, " +
        "or enable local rendering by setting USE_LOCAL_RENDERER=true",
    );
  }
  return process.env.VIS_REQUEST_SERVER;
}

/**
 * Get the `SERVICE_ID` from environment variables.
 */
export function getServiceIdentifier() {
  return process.env.SERVICE_ID;
}

/**
 * Get the list of disabled tools from environment variables.
 * By default, all map tools are disabled because they require external server.
 */
export function getDisabledTools(): string[] {
  // Default disabled tools (map tools that require external server)
  const defaultDisabledTools = [
    "generate_district_map",
    "generate_path_map",
    "generate_pin_map",
    "generate_korea_district_map",
    "generate_korea_pin_map",
    "generate_korea_path_map",
  ];

  const disabledTools = process.env.DISABLED_TOOLS;

  // If DISABLED_TOOLS is not set, return default disabled tools
  if (!disabledTools || disabledTools === "undefined") {
    return defaultDisabledTools;
  }

  // If DISABLED_TOOLS is explicitly set, use it (allows user to override defaults)
  return disabledTools.split(",").map((tool) => tool.trim());
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
 * Default is true (local rendering enabled by default).
 */
export function useLocalRenderer(): boolean {
  // Default to true if not explicitly set
  if (process.env.USE_LOCAL_RENDERER === undefined) {
    return true;
  }
  return process.env.USE_LOCAL_RENDERER === "true";
}

/**
 * Get the output directory for locally generated charts.
 */
export function getOutputDir(): string {
  return process.env.OUTPUT_DIR || "./output";
}
