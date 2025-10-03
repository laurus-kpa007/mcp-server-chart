import fs from "node:fs";
import path from "node:path";
import { render } from "@antv/gpt-vis-ssr";
import { getOutputDir } from "./env";

/**
 * Generate a chart locally using GPT-Vis-SSR and save it to the output directory.
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

    // Generate the chart using GPT-Vis-SSR
    const vis = await render({
      type,
      ...options,
    } as any);

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
