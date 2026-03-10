import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { callTool } from "../src/utils/callTool";

// Set local renderer environment
process.env.USE_LOCAL_RENDERER = "true";
process.env.OUTPUT_DIR = "./output/test";

// Test data matching actual chart schemas
const chartTests: Record<string, { tool: string; args: object }> = {
  area: {
    tool: "generate_area_chart",
    args: {
      data: [
        { time: "2020", value: 10 },
        { time: "2021", value: 20 },
        { time: "2022", value: 30 },
      ],
      title: "Test Area Chart",
    },
  },
  bar: {
    tool: "generate_bar_chart",
    args: {
      data: [
        { category: "A", value: 10 },
        { category: "B", value: 20 },
        { category: "C", value: 30 },
      ],
      title: "Test Bar Chart",
    },
  },
  column: {
    tool: "generate_column_chart",
    args: {
      data: [
        { category: "A", value: 10 },
        { category: "B", value: 20 },
        { category: "C", value: 30 },
      ],
      title: "Test Column Chart",
    },
  },
  line: {
    tool: "generate_line_chart",
    args: {
      data: [
        { time: "2020", value: 10 },
        { time: "2021", value: 20 },
        { time: "2022", value: 30 },
      ],
      title: "Test Line Chart",
    },
  },
  pie: {
    tool: "generate_pie_chart",
    args: {
      data: [
        { category: "A", value: 30 },
        { category: "B", value: 40 },
        { category: "C", value: 30 },
      ],
      title: "Test Pie Chart",
    },
  },
  scatter: {
    tool: "generate_scatter_chart",
    args: {
      data: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ],
      title: "Test Scatter Chart",
    },
  },
  radar: {
    tool: "generate_radar_chart",
    args: {
      data: [
        { name: "Speed", value: 80 },
        { name: "Power", value: 60 },
        { name: "Defense", value: 70 },
      ],
      title: "Test Radar Chart",
    },
  },
  funnel: {
    tool: "generate_funnel_chart",
    args: {
      data: [
        { category: "Visit", value: 100 },
        { category: "Cart", value: 60 },
        { category: "Order", value: 30 },
      ],
      title: "Test Funnel Chart",
    },
  },
  liquid: {
    tool: "generate_liquid_chart",
    args: {
      percent: 0.75,
      title: "Test Liquid Chart",
    },
  },
  histogram: {
    tool: "generate_histogram_chart",
    args: {
      data: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      title: "Test Histogram Chart",
    },
  },
  "word-cloud": {
    tool: "generate_word_cloud_chart",
    args: {
      data: [
        { text: "Hello", value: 100 },
        { text: "World", value: 80 },
        { text: "Chart", value: 60 },
        { text: "Test", value: 40 },
      ],
      title: "Test Word Cloud",
    },
  },
  "dual-axes": {
    tool: "generate_dual_axes_chart",
    args: {
      categories: ["2020", "2021", "2022"],
      series: [
        { type: "column", data: [10, 20, 30], axisYTitle: "Sales" },
        { type: "line", data: [0.1, 0.2, 0.3], axisYTitle: "Rate" },
      ],
      title: "Test Dual Axes Chart",
    },
  },
  venn: {
    tool: "generate_venn_chart",
    args: {
      data: [
        { sets: ["A"], value: 10 },
        { sets: ["B"], value: 10 },
        { sets: ["A", "B"], value: 5 },
      ],
      title: "Test Venn Chart",
    },
  },
  boxplot: {
    tool: "generate_boxplot_chart",
    args: {
      data: [
        { category: "A", value: 10 },
        { category: "A", value: 20 },
        { category: "A", value: 30 },
        { category: "A", value: 40 },
        { category: "B", value: 15 },
        { category: "B", value: 25 },
        { category: "B", value: 35 },
      ],
      title: "Test Boxplot Chart",
    },
  },
  treemap: {
    tool: "generate_treemap_chart",
    args: {
      data: [
        { name: "Design", value: 70 },
        {
          name: "Development",
          value: 50,
          children: [
            { name: "Frontend", value: 30 },
            { name: "Backend", value: 20 },
          ],
        },
      ],
      title: "Test Treemap Chart",
    },
  },
  violin: {
    tool: "generate_violin_chart",
    args: {
      data: [
        { category: "Group A", value: 10 },
        { category: "Group A", value: 20 },
        { category: "Group A", value: 15 },
        { category: "Group B", value: 25 },
        { category: "Group B", value: 30 },
        { category: "Group B", value: 28 },
      ],
      title: "Test Violin Chart",
    },
  },
  sankey: {
    tool: "generate_sankey_chart",
    args: {
      data: [
        { source: "Budget", target: "Marketing", value: 40 },
        { source: "Budget", target: "Development", value: 60 },
        { source: "Marketing", target: "Online", value: 25 },
        { source: "Marketing", target: "Offline", value: 15 },
      ],
      title: "Test Sankey Chart",
    },
  },
  "mind-map": {
    tool: "generate_mind_map",
    args: {
      data: {
        name: "Project",
        children: [
          { name: "Frontend", children: [{ name: "React" }, { name: "Vue" }] },
          { name: "Backend", children: [{ name: "Node" }] },
        ],
      },
      title: "Test Mind Map",
    },
  },
  "flow-diagram": {
    tool: "generate_flow_diagram",
    args: {
      data: {
        nodes: [{ name: "Start" }, { name: "Process" }, { name: "End" }],
        edges: [
          { source: "Start", target: "Process", name: "step1" },
          { source: "Process", target: "End", name: "step2" },
        ],
      },
      title: "Test Flow Diagram",
    },
  },
  "fishbone-diagram": {
    tool: "generate_fishbone_diagram",
    args: {
      data: {
        name: "Quality Issue",
        children: [
          {
            name: "People",
            children: [{ name: "Training" }, { name: "Experience" }],
          },
          { name: "Process", children: [{ name: "Workflow" }] },
        ],
      },
      title: "Test Fishbone Diagram",
    },
  },
  "network-graph": {
    tool: "generate_network_graph",
    args: {
      data: {
        nodes: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }],
        edges: [
          { source: "Alice", target: "Bob", name: "friend" },
          { source: "Bob", target: "Charlie", name: "colleague" },
        ],
      },
      title: "Test Network Graph",
    },
  },
  "organization-chart": {
    tool: "generate_organization_chart",
    args: {
      data: {
        name: "CEO",
        children: [
          { name: "CTO", children: [{ name: "Dev Lead" }] },
          { name: "CFO" },
        ],
      },
      title: "Test Organization Chart",
    },
  },
  waterfall: {
    tool: "generate_waterfall_chart",
    args: {
      data: [
        { category: "Revenue", value: 100 },
        { category: "Cost", value: -40 },
        { category: "Profit", value: 60 },
      ],
      title: "Test Waterfall Chart",
    },
  },
  spreadsheet: {
    tool: "generate_spreadsheet",
    args: {
      data: [
        { name: "Alice", age: 30, score: 95 },
        { name: "Bob", age: 25, score: 82 },
        { name: "Charlie", age: 35, score: 78 },
      ],
      title: "Test Spreadsheet",
    },
  },
};

// Clean up test output directory before tests
const outputDir = "./output/test";
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

describe("Chart Local Rendering", () => {
  for (const [chartName, { tool, args }] of Object.entries(chartTests)) {
    it(`should render "${chartName}" chart locally`, async () => {
      const result = await callTool(tool, args);

      // Should return content with text (file path)
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);

      const textContent = result.content[0];
      expect(textContent.type).toBe("text");

      const filePath = (textContent as { type: string; text: string }).text;
      expect(filePath).toBeTruthy();

      // Check file exists and has content
      const resolvedPath = path.resolve(filePath);
      expect(fs.existsSync(resolvedPath)).toBe(true);

      const stats = fs.statSync(resolvedPath);
      expect(stats.size).toBeGreaterThan(0);

      console.log(
        `✅ ${chartName}: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)}KB)`,
      );
    }, 30000);
  }
});
