/**
 * Internationalization utilities for MCP Server Chart
 */

export type SupportedLocale = "en" | "ko" | "zh";

interface LocaleStrings {
  [key: string]: string;
}

interface Translations {
  [locale: string]: LocaleStrings;
}

const translations: Translations = {
  en: {
    "chart.area.description": "Generate an area chart, used to display the trend of data under a continuous independent variable.",
    "chart.bar.description": "Generate a bar chart, used to compare values across different categories.",
    "chart.column.description": "Generate a column chart, used to compare values across different categories.",
    "chart.line.description": "Generate a line chart, used to display the trend of data over time.",
    "chart.pie.description": "Generate a pie chart, used to display the proportion of data.",
    "chart.scatter.description": "Generate a scatter plot, used to display the relationship between two variables.",
    "chart.radar.description": "Generate a radar chart, used to display multi-dimensional data comprehensively.",
    "chart.funnel.description": "Generate a funnel chart, used to display data loss at different stages.",
    "chart.boxplot.description": "Generate a boxplot, used to display the distribution of data.",
    "chart.histogram.description": "Generate a histogram, used to display the distribution of data by intervals.",
    "chart.liquid.description": "Generate a liquid chart, used to display the proportion of data.",
    "chart.sankey.description": "Generate a sankey chart, used to display data flow and volume.",
    "chart.treemap.description": "Generate a treemap, used to display hierarchical data.",
    "chart.venn.description": "Generate a venn diagram, used to display relationships between sets.",
    "chart.violin.description": "Generate a violin plot, used to display the distribution of data.",
    "chart.wordcloud.description": "Generate a word cloud, used to display the frequency of words in textual data.",
  },
  ko: {
    "chart.area.description": "영역 차트를 생성합니다. 연속적인 독립 변수에 따른 데이터 추세를 표시하는 데 사용됩니다.",
    "chart.bar.description": "막대 차트를 생성합니다. 서로 다른 카테고리 간의 값을 비교하는 데 사용됩니다.",
    "chart.column.description": "세로 막대 차트를 생성합니다. 서로 다른 카테고리 간의 값을 수직으로 비교하는 데 사용됩니다.",
    "chart.line.description": "선 차트를 생성합니다. 시간에 따른 데이터 추세를 표시하는 데 사용됩니다.",
    "chart.pie.description": "원형 차트를 생성합니다. 데이터의 비율을 표시하는 데 사용됩니다.",
    "chart.scatter.description": "산점도를 생성합니다. 두 변수 간의 관계를 표시하는 데 사용됩니다.",
    "chart.radar.description": "레이더 차트를 생성합니다. 다차원 데이터를 종합적으로 표시하는 데 사용됩니다.",
    "chart.funnel.description": "깔때기 차트를 생성합니다. 여러 단계에서의 데이터 손실을 표시하는 데 사용됩니다.",
    "chart.boxplot.description": "박스플롯을 생성합니다. 데이터의 분포를 표시하는 데 사용됩니다.",
    "chart.histogram.description": "히스토그램을 생성합니다. 구간별 데이터 분포를 표시하는 데 사용됩니다.",
    "chart.liquid.description": "리퀴드 차트를 생성합니다. 데이터의 비율을 물이 차오르는 형태로 표시하는 데 사용됩니다.",
    "chart.sankey.description": "생키 차트를 생성합니다. 데이터 흐름과 양을 표시하는 데 사용됩니다.",
    "chart.treemap.description": "트리맵을 생성합니다. 계층적 데이터를 표시하는 데 사용됩니다.",
    "chart.venn.description": "벤 다이어그램을 생성합니다. 집합 간의 관계를 표시하는 데 사용됩니다.",
    "chart.violin.description": "바이올린 플롯을 생성합니다. 데이터의 분포를 상세히 표시하는 데 사용됩니다.",
    "chart.wordcloud.description": "워드 클라우드를 생성합니다. 텍스트 데이터에서 단어의 빈도를 표시하는 데 사용됩니다.",
  },
  zh: {
    "chart.area.description": "生成面积图，用于显示连续自变量下数据的趋势。",
    "chart.bar.description": "生成条形图，用于比较不同类别的值。",
    "chart.column.description": "生成柱状图，用于垂直比较不同类别的值。",
    "chart.line.description": "生成折线图，用于显示数据随时间的趋势。",
    "chart.pie.description": "生成饼图，用于显示数据的比例。",
    "chart.scatter.description": "生成散点图，用于显示两个变量之间的关系。",
    "chart.radar.description": "生成雷达图，用于全面显示多维数据。",
    "chart.funnel.description": "生成漏斗图，用于显示不同阶段的数据损失。",
    "chart.boxplot.description": "生成箱线图，用于显示数据的分布。",
    "chart.histogram.description": "生成直方图，用于按区间显示数据分布。",
    "chart.liquid.description": "生成水波图，用于显示数据的比例。",
    "chart.sankey.description": "生成桑基图，用于显示数据流量和流向。",
    "chart.treemap.description": "生成树图，用于显示层次数据。",
    "chart.venn.description": "生成维恩图，用于显示集合之间的关系。",
    "chart.violin.description": "生成小提琴图，用于详细显示数据的分布。",
    "chart.wordcloud.description": "生成词云，用于显示文本数据中单词的频率。",
  },
};

/**
 * Get the current locale from environment variables or default to English
 */
export function getLocale(): SupportedLocale {
  const locale = process.env.LOCALE || process.env.LANG || "en";

  if (locale.startsWith("ko")) return "ko";
  if (locale.startsWith("zh")) return "zh";
  return "en";
}

/**
 * Translate a key to the current locale
 */
export function t(key: string, locale?: SupportedLocale): string {
  const currentLocale = locale || getLocale();
  return translations[currentLocale]?.[key] || translations.en[key] || key;
}

/**
 * Get all translations for a specific locale
 */
export function getTranslations(locale: SupportedLocale): LocaleStrings {
  return translations[locale] || translations.en;
}
