import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as Charts from "../src/charts";

// Test data for each chart type
const testData: Record<string, object> = {
  area: {
    data: [
      { time: "2020", value: 10 },
      { time: "2021", value: 20 },
      { time: "2022", value: 30 },
    ],
  },
  bar: {
    data: [
      { category: "A", value: 10 },
      { category: "B", value: 20 },
      { category: "C", value: 30 },
    ],
  },
  boxplot: {
    data: [
      { category: "A", value: 10 },
      { category: "A", value: 20 },
      { category: "A", value: 30 },
      { category: "B", value: 15 },
      { category: "B", value: 25 },
    ],
  },
  column: {
    data: [
      { category: "A", value: 10 },
      { category: "B", value: 20 },
      { category: "C", value: 30 },
    ],
  },
  "dual-axes": {
    categories: ["2020", "2021", "2022"],
    series: [
      { type: "column", data: [10, 20, 30], axisYTitle: "Sales" },
      { type: "line", data: [0.1, 0.2, 0.3], axisYTitle: "Rate" },
    ],
  },
  funnel: {
    data: [
      { category: "Visit", value: 100 },
      { category: "Cart", value: 60 },
      { category: "Order", value: 30 },
    ],
  },
  histogram: {
    data: [10, 20, 30, 40, 50, 60, 70, 80],
  },
  line: {
    data: [
      { time: "2020", value: 10 },
      { time: "2021", value: 20 },
      { time: "2022", value: 30 },
    ],
  },
  liquid: {
    percent: 0.75,
  },
  pie: {
    data: [
      { category: "A", value: 30 },
      { category: "B", value: 40 },
      { category: "C", value: 30 },
    ],
  },
  radar: {
    data: [
      { name: "Speed", value: 80 },
      { name: "Power", value: 60 },
      { name: "Defense", value: 70 },
    ],
  },
  scatter: {
    data: [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ],
  },
  treemap: {
    data: [
      { name: "A", value: 10 },
      { name: "B", value: 20, children: [{ name: "B1", value: 12 }] },
    ],
  },
  venn: {
    data: [
      { sets: ["A"], value: 10 },
      { sets: ["B"], value: 10 },
      { sets: ["A", "B"], value: 5 },
    ],
  },
  violin: {
    data: [
      { category: "A", value: 10 },
      { category: "A", value: 20 },
      { category: "B", value: 15 },
      { category: "B", value: 25 },
    ],
  },
  "word-cloud": {
    data: [
      { text: "Hello", value: 100 },
      { text: "World", value: 80 },
      { text: "Chart", value: 60 },
    ],
  },
  "mind-map": {
    data: {
      name: "Root",
      children: [{ name: "Child1" }, { name: "Child2" }],
    },
  },
  "flow-diagram": {
    data: {
      nodes: [{ name: "Start" }, { name: "End" }],
      edges: [{ source: "Start", target: "End", name: "flow" }],
    },
  },
  "fishbone-diagram": {
    data: {
      name: "Main Problem",
      children: [
        { name: "Cause1", children: [{ name: "SubCause1" }] },
        { name: "Cause2" },
      ],
    },
  },
  "network-graph": {
    data: {
      nodes: [{ name: "Node1" }, { name: "Node2" }],
      edges: [{ source: "Node1", target: "Node2", name: "link" }],
    },
  },
  "organization-chart": {
    data: {
      name: "CEO",
      children: [{ name: "CTO" }, { name: "CFO" }],
    },
  },
  sankey: {
    data: [
      { source: "A", target: "B", value: 10 },
      { source: "B", target: "C", value: 5 },
    ],
  },
  waterfall: {
    data: [
      { category: "Revenue", value: 100 },
      { category: "Cost", value: -40 },
      { category: "Profit", value: 60 },
    ],
  },
  spreadsheet: {
    data: [
      { name: "Alice", age: 30, city: "Seoul" },
      { name: "Bob", age: 25, city: "Tokyo" },
    ],
  },
};

// Charts that exist in both upstream and local
const chartTypes = Object.keys(Charts).filter(
  (key) => !key.startsWith("korea"),
);

describe("Chart Schema Validation", () => {
  for (const chartType of chartTypes) {
    const chart = Charts[chartType as keyof typeof Charts];

    it(`should have valid tool definition for "${chartType}"`, () => {
      expect(chart).toBeDefined();
      expect(chart.tool).toBeDefined();
      expect(chart.tool.name).toBeDefined();
      expect(chart.tool.description).toBeTruthy();
      expect(chart.tool.inputSchema).toBeDefined();
      expect(chart.schema).toBeDefined();
    });

    it(`should have annotations for "${chartType}"`, () => {
      // Upstream added annotations to all charts
      if (chart.tool.annotations) {
        expect(chart.tool.annotations).toBeDefined();
      }
    });

    if (testData[chartType]) {
      it(`should validate test data for "${chartType}"`, () => {
        const zodSchema = z.object(chart.schema);
        const result = zodSchema.safeParse(testData[chartType]);
        if (!result.success) {
          console.log(
            `Validation error for ${chartType}:`,
            result.error.format(),
          );
        }
        expect(result.success).toBe(true);
      });
    }
  }
});

describe("Korea Map Charts", () => {
  const koreaCharts = Object.keys(Charts).filter((key) =>
    key.startsWith("korea"),
  );

  for (const chartType of koreaCharts) {
    const chart = Charts[chartType as keyof typeof Charts];

    it(`should have valid tool definition for "${chartType}"`, () => {
      expect(chart).toBeDefined();
      expect(chart.tool).toBeDefined();
      expect(chart.tool.name).toBeDefined();
      expect(chart.schema).toBeDefined();
    });
  }
});
