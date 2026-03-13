# MCP Server Chart  ![](https://badge.mcpx.dev?type=server 'MCP Server')  [![build](https://github.com/antvis/mcp-server-chart/actions/workflows/build.yml/badge.svg)](https://github.com/antvis/mcp-server-chart/actions/workflows/build.yml) [![npm Version](https://img.shields.io/npm/v/@antv/mcp-server-chart.svg)](https://www.npmjs.com/package/@antv/mcp-server-chart) [![smithery badge](https://smithery.ai/badge/@antvis/mcp-server-chart)](https://smithery.ai/server/@antvis/mcp-server-chart) [![npm License](https://img.shields.io/npm/l/@antv/mcp-server-chart.svg)](https://www.npmjs.com/package/@antv/mcp-server-chart) [![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/antvis/mcp-server-chart)](https://archestra.ai/mcp-catalog/antvis__mcp-server-chart)

**[한국어](./README.md)** | English

A Model Context Protocol server for generating charts using [AntV](https://github.com/antvis/). We can use this MCP server for _chart generation_ and _data analysis_.

<a href="https://www.star-history.com/#antvis/mcp-server-chart&Date">
  <img width="512" src="https://api.star-history.com/svg?repos=antvis/mcp-server-chart&type=Date" />
</a>

This is a TypeScript-based MCP server that provides chart generation capabilities. It allows you to create various types of charts through MCP tools. You can also use it in [Dify](https://marketplace.dify.ai/plugins/antv/visualization).

## 📋 Table of Contents

- [✨ Features](#-features)
- [🤖 Usage](#-usage)
- [🚰 Run with SSE or Streamable transport](#-run-with-sse-or-streamable-transport)
- [🎮 CLI Options](#-cli-options)
- [⚙️ Environment Variables](#%EF%B8%8F-environment-variables)
  - [VIS_REQUEST_SERVER](#-private-deployment)
  - [SERVICE_ID](#%EF%B8%8F-generate-records)
  - [DISABLED_TOOLS](#%EF%B8%8F-tool-filtering)
  - [Korea Map API Keys](#-korea-map-support)
- [📠 Private Deployment](#-private-deployment)
- [🗺️ Generate Records](#%EF%B8%8F-generate-records)
- [🎛️ Tool Filtering](#%EF%B8%8F-tool-filtering)
- [🇰🇷 Korea Map Support](#-korea-map-support)
- [🔨 Development](#-development)
- [📄 License](#-license)

## ✨ Features

Now 32 chart generation tools supported. Local rendering is enabled by default — 24 chart types are rendered locally without requiring an external API.

<img width="768" alt="mcp-server-chart preview" src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*IyIRQIQHyKYAAAAAgCAAAAgAemJ7AQ/fmt.avif" />

### Basic Charts

1. `generate_area_chart`: Generate an **area** chart — display the trend of data under a continuous independent variable, allowing observation of overall data trends.
2. `generate_bar_chart`: Generate a **bar** chart — compare values across different categories, suitable for horizontal comparisons.
3. `generate_boxplot_chart`: Generate a **boxplot** — display the distribution of data, including the median, quartiles, and outliers.
4. `generate_column_chart`: Generate a **column** chart — compare values across different categories, suitable for vertical comparisons.
5. `generate_dual_axes_chart`: Generate a **dual-axes** chart — display the relationship between two variables with different units or ranges.
6. `generate_funnel_chart`: Generate a **funnel** chart — display data loss at different stages.
7. `generate_histogram_chart`: Generate a **histogram** — display the distribution of data by dividing it into intervals and counting data points in each interval.
8. `generate_line_chart`: Generate a **line** chart — display the trend of data over time or another continuous variable.
9. `generate_liquid_chart`: Generate a **liquid** chart — display the proportion of data, visually representing percentages in the form of water-filled spheres.
10. `generate_pie_chart`: Generate a **pie** chart — display the proportion of data, dividing it into parts represented by sectors showing the percentage of each part.
11. `generate_radar_chart`: Generate a **radar** chart — display multi-dimensional data comprehensively, showing multiple dimensions in a radar-like format.
12. `generate_sankey_chart`: Generate a **sankey** chart — display data flow and volume, representing the movement of data between different nodes in a Sankey-style format.
13. `generate_scatter_chart`: Generate a **scatter** plot — display the relationship between two variables, showing data points as scattered dots on a coordinate system.
14. `generate_treemap_chart`: Generate a **treemap** — display hierarchical data, showing data in rectangular forms where the size of rectangles represents the value of the data.
15. `generate_waterfall_chart`: Generate a **waterfall** chart — visualize the cumulative effect of sequentially introduced positive or negative values. Ideal for financial analysis, budget tracking, and profit and loss statements.
16. `generate_violin_chart`: Generate a **violin** plot — display the distribution of data, combining features of boxplots and density plots to provide a more detailed view.

### Diagrams & Graphs

17. `generate_fishbone_diagram`: Generate a **fishbone** diagram — also known as an Ishikawa diagram, used to identify and display the root causes of a problem.
18. `generate_flow_diagram`: Generate a **flowchart** — display the steps and sequence of a process.
19. `generate_mind_map`: Generate a **mind map** — display thought processes and hierarchical information.
20. `generate_network_graph`: Generate a **network** graph — display relationships and connections between nodes.
21. `generate_organization_chart`: Generate an **organizational** chart — display the structure of an organization and personnel relationships.
22. `generate_venn_chart`: Generate a **venn** diagram — display relationships between sets, including intersections, unions, and differences.
23. `generate_word_cloud_chart`: Generate a **word cloud** — display the frequency of words in textual data, with font sizes indicating the frequency of each word.

### Data Tables

24. `generate_spreadsheet`: Generate a **spreadsheet** or pivot table — display tabular data. When `rows` or `values` fields are provided, it renders as a pivot table; otherwise, it renders as a regular table.

### China Map Charts (Using AMap Service)

25. `generate_district_map`: Generate a **district map** — show administrative divisions and data distribution in China.
26. `generate_path_map`: Generate a **path map** — display route planning results for POIs in China.
27. `generate_pin_map`: Generate a **pin map** — show the distribution of POIs in China.

> [!NOTE]
> The above China map visualization tools use [AMap service](https://lbs.amap.com/) and currently only support map generation within China.

### 🇰🇷 Korea Map Charts

28. `generate_korea_district_map`: Generate a **Korea district map** — display administrative divisions (si/do, si/gun/gu) and data distribution in South Korea.
29. `generate_korea_path_map`: Generate a **Korea path map** — display route planning results for POIs in South Korea.
30. `generate_korea_pin_map`: Generate a **Korea pin map** — show the distribution of POIs in South Korea.

> [!NOTE]
> Korea map visualization tools use Kakao Maps or Naver Maps API. API keys must be set as environment variables to use these tools.

> [!IMPORTANT]
> All 6 map tools (3 China + 3 Korea) are **disabled by default** because they require external map services. To enable them, set the `DISABLED_TOOLS` environment variable to override the defaults.

## 🤖 Usage

To use with `Desktop APP`, such as Claude, VSCode, [Cline](https://cline.bot/mcp-marketplace), Cherry Studio, Cursor, and so on, add the MCP server config below. On Mac system:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ]
    }
  }
}
```

On Windows system:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@antv/mcp-server-chart"
      ]
    }
  }
}
```

Also, you can use it on [aliyun](https://bailian.console.aliyun.com/?tab=mcp#/mcp-market/detail/antv-visualization-chart), [modelscope](https://www.modelscope.cn/mcp/servers/@antvis/mcp-server-chart), [glama.ai](https://glama.ai/mcp/servers/@antvis/mcp-server-chart), [smithery.ai](https://smithery.ai/server/@antvis/mcp-server-chart) or others with HTTP, SSE Protocol.

## 🚰 Run with SSE or Streamable transport

### Run directly

Install the package globally.

```bash
npm install -g @antv/mcp-server-chart
```

Run the server with your preferred transport option:

```bash
# For SSE transport (default endpoint: /sse)
mcp-server-chart --transport sse

# For Streamable transport with custom endpoint
mcp-server-chart --transport streamable
```

Then you can access the server at:

- SSE transport: `http://localhost:1122/sse`
- Streamable transport: `http://localhost:1122/mcp`

### Docker deploy

Enter the docker directory.

```bash
cd docker
```

Deploy using docker-compose.

```bash
docker compose up -d
```

Then you can access the server at:

- SSE transport: `http://localhost:1123/sse`
- Streamable transport: `http://localhost:1122/mcp`

## 🎮 CLI Options

You can use the following CLI options when running the MCP server. Command options by running cli with `-H`.

```plain
MCP Server Chart CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --host, -h       Specify the host for SSE or streamable transport (default: "localhost")
  --port, -p       Specify the port for SSE or streamable transport (default: 1122)
  --endpoint, -e   Specify the endpoint for the transport:
                   - For SSE: default is "/sse"
                   - For streamable: default is "/mcp"
  --help, -H       Show this help message
```

## ⚙️ Environment Variables

| Variable | Description | Default | Example |
|----------|:------------|---------|---------|
| `VIS_REQUEST_SERVER` | Custom chart generation service URL for private deployment | `https://antv-studio.alipay.com/api/gpt-vis` | `https://your-server.com/api/chart` |
| `SERVICE_ID` | Service identifier for chart generation records | - | `your-service-id-123` |
| `DISABLED_TOOLS` | Comma-separated list of tool names to disable | 6 map tools disabled | `generate_fishbone_diagram,generate_mind_map` |
| `USE_LOCAL_RENDERER` | Enable/disable local chart rendering | `true` | `false` |
| `OUTPUT_DIR` | Output directory for locally rendered charts | `./output` | `/path/to/output` |
| `LOCALE` | Interface language setting | `en` | `ko`, `zh`, `en` |
| `KAKAO_MAP_API_KEY` | Kakao Maps API key (for Korea maps) | - | `your-kakao-api-key` |
| `NAVER_MAP_CLIENT_ID` | Naver Maps Client ID (for Korea maps) | - | `your-naver-client-id` |
| `NAVER_MAP_CLIENT_SECRET` | Naver Maps Client Secret (for Korea maps) | - | `your-naver-client-secret` |

### 📠 Private Deployment

`MCP Server Chart` provides a free chart generation service by default. For users with a need for private deployment, they can try using `VIS_REQUEST_SERVER` to customize their own chart generation service.

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ],
      "env": {
        "VIS_REQUEST_SERVER": "<YOUR_VIS_REQUEST_SERVER>"
      }
    }
  }
}
```

You can use AntV's project [GPT-Vis-SSR](https://github.com/antvis/GPT-Vis/tree/main/bindings/gpt-vis-ssr) to deploy an HTTP service in a private environment, and then pass the URL address through env `VIS_REQUEST_SERVER`.

- **Method**: `POST`
- **Parameter**: Which will be passed to `GPT-Vis-SSR` for rendering. Such as, `{ "type": "line", "data": [{ "time": "2025-05", "value": 512 }, { "time": "2025-06", "value": 1024 }] }`.
- **Return**: The return object of HTTP service.
  - **success**: `boolean` Whether generate chart image successfully.
  - **resultObj**: `string` The chart image url.
  - **errorMessage**: `string` When `success = false`, return the error message.

> [!NOTE]
> The private deployment solution currently does not support 6 geographic visualization tools: `generate_district_map`, `generate_path_map`, `generate_pin_map`, `generate_korea_district_map`, `generate_korea_path_map`, `generate_korea_pin_map`.

### 🗺️ Generate Records

By default, users are required to save the results themselves, but we also provide a service for viewing the chart generation records, which requires users to generate a service identifier for themselves and configure it.

Use Alipay to scan and open the mini program to generate a personal service identifier (click the "My" menu below, enter the "My Services" page, click the "Generate" button, and click the "Copy" button after success):

<img alt="my service identifier website" width="240" src="https://mdn.alipayobjects.com/huamei_dxq8v0/afts/img/dASoTLt6EywAAAAARqAAAAgADu43AQFr/fmt.webp" />

Next, you need to add the `SERVICE_ID` environment variable to the MCP server configuration. For example, the configuration for Mac is as follows (for Windows systems, just add the `env` variable):

```json
{
  "mcpServers": {
    "AntV Map": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ],
      "env": {
        "SERVICE_ID": "***********************************"
      }
    }
  }
}
```

After updating the MCP Server configuration, you need to restart your AI client application and check again whether you have started and connected to the MCP Server successfully. Then you can try to generate the map again. After the generation is successful, you can go to the "My Map" page of the mini program to view your map generation records.

<img alt="my map records website" width="240" src="https://mdn.alipayobjects.com/huamei_dxq8v0/afts/img/RacFR7emR3QAAAAAUkAAAAgADu43AQFr/original" />

### 🎛️ Tool Filtering

You can disable specific chart generation tools using the `DISABLED_TOOLS` environment variable. This is useful when certain tools have compatibility issues with your MCP client or when you want to limit the available functionality.

By default, 6 map tools are disabled:
- `generate_district_map`, `generate_path_map`, `generate_pin_map`
- `generate_korea_district_map`, `generate_korea_pin_map`, `generate_korea_path_map`

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-chart"
      ],
      "env": {
        "DISABLED_TOOLS": "generate_fishbone_diagram,generate_mind_map"
      }
    }
  }
}
```

> [!NOTE]
> Setting `DISABLED_TOOLS` **overrides** the default disabled list. If you also want to keep the map tools disabled, include them in your list.

**Available tool names for filtering** See the [✨ Features](#-features).

## 🇰🇷 Korea Map Support

Korea map features require a Kakao Maps or Naver Maps API key.

### Kakao Maps API Key

1. Go to [Kakao Developers](https://developers.kakao.com/) and sign in
2. "My Applications" > "Add Application"
3. After creating the app, copy the "JavaScript Key" or "REST API Key"
4. Add to environment variables:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "KAKAO_MAP_API_KEY": "your-kakao-api-key"
      }
    }
  }
}
```

### Naver Maps API Key

1. Go to [Naver Cloud Platform](https://www.ncloud.com/) and sign in
2. "AI·NAVER API" > "Register Application"
3. Select and register "Maps" service
4. Copy Client ID and Client Secret
5. Add to environment variables:

```json
{
  "mcpServers": {
    "mcp-server-chart": {
      "command": "npx",
      "args": ["-y", "@antv/mcp-server-chart"],
      "env": {
        "NAVER_MAP_CLIENT_ID": "your-naver-client-id",
        "NAVER_MAP_CLIENT_SECRET": "your-naver-client-secret"
      }
    }
  }
}
```

### Korea Map Usage Examples

```javascript
// Seoul major attractions map
{
  "title": "Seoul Major Attractions",
  "data": ["Seoul Namsan Tower", "Seoul Gyeongbokgung", "Seoul Myeongdong Cathedral", "Seoul Cheonggyecheon"],
  "mapProvider": "kakao"
}

// South Korea population distribution by province
{
  "title": "South Korea Population Distribution",
  "data": {
    "name": "South Korea",
    "showAllSubdistricts": true,
    "dataLabel": "Population",
    "dataType": "number",
    "dataValueUnit": "10K",
    "colors": ["#4ECDC4"],
    "subdistricts": [
      {"name": "Seoul", "dataValue": "967"},
      {"name": "Busan", "dataValue": "339"},
      {"name": "Gyeonggi-do", "dataValue": "1356"}
    ]
  },
  "mapProvider": "kakao"
}
```

## 🔨 Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

Start the MCP server with Inspector:

```bash
npm run start
```

Run tests:

```bash
npm run test
```

Start the MCP server with SSE transport:

```bash
node build/index.js -t sse
```

Start the MCP server with Streamable transport:

```bash
node build/index.js -t streamable
```

## 📄 License

MIT@[AntV](https://github.com/antvis).
