import fs from "node:fs";
import path from "node:path";
import { createChart } from "@antv/g2-ssr";
import { render } from "@antv/gpt-vis-ssr";
import { getOutputDir } from "./env";

/**
 * Chart types supported by @antv/gpt-vis-ssr for local rendering.
 */
const GPT_VIS_SUPPORTED_TYPES = new Set([
  "area",
  "bar",
  "boxplot",
  "column",
  "dual-axes",
  "fishbone-diagram",
  "flow-diagram",
  "funnel",
  "histogram",
  "line",
  "liquid",
  "mind-map",
  "network-graph",
  "organization-chart",
  "pie",
  "radar",
  "sankey",
  "scatter",
  "treemap",
  "venn",
  "violin",
  "word-cloud",
]);

/**
 * All chart types supported for local rendering (gpt-vis-ssr + custom renderers).
 */
export const LOCAL_SUPPORTED_TYPES = new Set([
  ...GPT_VIS_SUPPORTED_TYPES,
  "waterfall",
  "spreadsheet",
]);

/**
 * Default theme matching gpt-vis-ssr's default theme.
 */
const DEFAULT_THEME = {
  type: "light" as const,
  view: {
    viewFill: "#FFF",
    plotFill: "transparent",
    mainFill: "transparent",
    contentFill: "transparent",
  },
  interval: { rect: { fillOpacity: 0.8 } },
};

/**
 * Custom waterfall chart renderer using G2-SSR directly.
 */
async function renderWaterfall(options: Record<string, any>) {
  const {
    data = [],
    title,
    width = 600,
    height = 400,
    axisXTitle,
    axisYTitle,
    style = {},
  } = options;
  const { backgroundColor, palette } = style;

  // Transform data for waterfall: compute running totals
  let runningTotal = 0;
  const waterfallData = data.map(
    (d: { category: string; value: number }, i: number) => {
      const start = runningTotal;
      runningTotal += d.value;
      return {
        category: d.category,
        value: [start, runningTotal],
        rawValue: d.value,
        isLast: i === data.length - 1,
      };
    },
  );

  return await createChart({
    devicePixelRatio: 3,
    theme: DEFAULT_THEME,
    width,
    height,
    ...(title ? { title: { title } } : {}),
    data: waterfallData,
    type: "interval",
    encode: {
      x: "category",
      y: "value",
      color: (d: { rawValue: number; isLast: boolean }) =>
        d.isLast ? "total" : d.rawValue >= 0 ? "increase" : "decrease",
    },
    scale: {
      y: { nice: true },
      color: {
        domain: ["increase", "decrease", "total"],
        range: palette || ["#22c55e", "#ef4444", "#3b82f6"],
      },
    },
    axis: {
      x: { title: axisXTitle },
      y: { title: axisYTitle },
    },
    labels: [
      {
        text: (d: { rawValue: number }) =>
          d.rawValue >= 0 ? `+${d.rawValue}` : `${d.rawValue}`,
        style: { dy: -12 },
        fontSize: 10,
      },
    ],
    legend: { color: {} },
    style: { radiusTopLeft: 4, radiusTopRight: 4 },
    ...(backgroundColor ? { viewStyle: { viewFill: backgroundColor } } : {}),
  } as any);
}

/**
 * Custom spreadsheet renderer using G2-SSR directly.
 * Renders as a simple table-like heatmap visualization.
 */
async function renderSpreadsheet(options: Record<string, any>) {
  const { data = [], title, width = 600, height = 400 } = options;

  // For spreadsheet, render as a simple table image using a cell/heatmap approach
  // Extract column headers from first row
  if (!data.length) {
    throw new Error("Spreadsheet data cannot be empty.");
  }

  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter((col) =>
    data.every(
      (row: Record<string, unknown>) =>
        typeof row[col] === "number" || row[col] === null,
    ),
  );

  // If there are numeric columns, render as a cell heatmap
  if (numericColumns.length > 0) {
    const heatmapData: { row: string; col: string; value: number }[] = [];
    const nonNumericCol = columns.find((c) => !numericColumns.includes(c));

    for (const row of data) {
      const rowLabel = nonNumericCol
        ? String(row[nonNumericCol])
        : String(data.indexOf(row));
      for (const col of numericColumns) {
        heatmapData.push({
          row: rowLabel,
          col,
          value: Number(row[col]) || 0,
        });
      }
    }

    return await createChart({
      devicePixelRatio: 3,
      theme: DEFAULT_THEME,
      width,
      height,
      ...(title ? { title: { title } } : {}),
      data: heatmapData,
      type: "cell",
      encode: { x: "col", y: "row", color: "value" },
      scale: { color: { palette: "blues" } },
      labels: [{ text: "value", fontSize: 10 }],
      axis: {
        x: { position: "top" },
        y: {},
      },
      legend: { color: { length: 200 } },
      style: { inset: 1 },
    } as any);
  }

  // Fallback: render first numeric-like column as bar chart
  const labelCol = columns[0];
  const valueCol =
    columns.find((c) => c !== labelCol) || columns[1] || columns[0];

  const barData = data.map((row: Record<string, unknown>, i: number) => ({
    category: String(row[labelCol] ?? `Row ${i}`),
    value: Number(row[valueCol]) || 0,
  }));

  return await createChart({
    devicePixelRatio: 3,
    theme: DEFAULT_THEME,
    width,
    height,
    ...(title ? { title: { title } } : {}),
    data: barData,
    type: "interval",
    encode: { x: "category", y: "value", color: "category" },
    scale: { y: { nice: true } },
    labels: [
      {
        text: "value",
        style: { dy: -12 },
        fontSize: 10,
      },
    ],
    legend: false,
    style: { radiusTopLeft: 4, radiusTopRight: 4 },
  } as any);
}

/**
 * Custom renderers for chart types not supported by gpt-vis-ssr.
 */
const CUSTOM_RENDERERS: Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: chart options vary
  (
    options: Record<string, any>,
  ) => Promise<{ toBuffer: () => Buffer; destroy: () => void }>
> = {
  waterfall: renderWaterfall,
  spreadsheet: renderSpreadsheet,
};

/**
 * Generate a chart locally using GPT-Vis-SSR or custom renderers.
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<string>} The local file path to the generated chart image.
 * @throws {Error} If the chart generation fails.
 */
export async function generateLocalChart(
  type: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  try {
    // Prepare the output directory
    const outputDir = getOutputDir();
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let vis: { toBuffer: () => Buffer; destroy: () => void };

    if (GPT_VIS_SUPPORTED_TYPES.has(type)) {
      // Use gpt-vis-ssr for supported types
      vis = await render({
        type,
        ...options,
      } as any);
    } else if (CUSTOM_RENDERERS[type]) {
      // Use custom renderer for waterfall, spreadsheet, etc.
      vis = await CUSTOM_RENDERERS[type](options);
    } else {
      throw new Error(`Unknown chart type: ${type}`);
    }

    // Get the image buffer
    const buffer = vis.toBuffer();

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.png`;
    const filepath = path.join(outputDir, filename);

    // Save the buffer to a file
    fs.writeFileSync(filepath, buffer);

    // Clean up resources
    vis.destroy();

    // Return the absolute path
    return path.resolve(filepath);
  } catch (error) {
    throw new Error(
      `Failed to generate local chart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
