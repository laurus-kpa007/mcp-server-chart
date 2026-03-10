import http from "node:http";
import https from "node:https";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import {
  getServiceIdentifier,
  getVisRequestServer,
  useLocalRenderer,
} from "./env";
import { LOCAL_SUPPORTED_TYPES, generateLocalChart } from "./local-renderer";
import { logger } from "./logger";

/**
 * Persistent axios instance with HTTP keep-alive to reuse TCP connections
 * across requests, reducing overhead under high concurrency.
 */
const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Generate a chart URL using the provided configuration.
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<string>} The generated chart URL or local file path.
 * @throws {Error} If the chart generation fails.
 */
export async function generateChartUrl(
  type: string,
  options: Record<string, any>,
): Promise<string> {
  // Check if local rendering is enabled and the chart type is supported locally
  if (useLocalRenderer()) {
    if (LOCAL_SUPPORTED_TYPES.has(type)) {
      return await generateLocalChart(type, options);
    }
    logger.warn(
      `Chart type "${type}" is not supported by local renderer, falling back to external API.`,
    );
  }

  // Use external API for chart generation
  const url = getVisRequestServer();

  const response = await httpClient.post(url, {
    type,
    ...options,
    source: "mcp-server-chart",
  });
  const { success, errorMessage, resultObj } = response.data;

  if (!success) {
    throw new Error(errorMessage);
  }

  return resultObj;
}

type ResponseResult = {
  metadata: unknown;
  /**
   * @docs https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result
   */
  content: CallToolResult["content"];
  isError?: CallToolResult["isError"];
};

/**
 * Generate a map
 * @param tool - The tool name
 * @param input - The input
 * @returns
 */
export async function generateMap(
  tool: string,
  input: unknown,
): Promise<ResponseResult> {
  const url = getVisRequestServer();

  const response = await httpClient.post(url, {
    serviceId: getServiceIdentifier(),
    tool,
    input,
    source: "mcp-server-chart",
  });
  const { success, errorMessage, resultObj } = response.data;

  if (!success) {
    throw new Error(errorMessage);
  }
  return resultObj;
}
