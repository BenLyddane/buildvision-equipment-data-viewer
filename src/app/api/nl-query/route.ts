import { NextRequest, NextResponse } from "next/server";
import datasetSummary from "@/data/generated/dataset-summary.json";

export const runtime = "nodejs";

type ChartSpec = {
  title: string;
  type: "bar" | "hbar" | "pie" | "line" | "table" | "kpi";
  explanation: string;
  xLabel?: string;
  yLabel?: string;
  data: Array<Record<string, any>>;
  series?: string[];
  categoryKey?: string;
  valueKey?: string;
  columns?: Array<{ key: string; header: string }>;
};

const SYSTEM_PROMPT = `You are a data analyst for the BuildVision Equipment Data Viewer.
You will be given a structured JSON summary of HVAC/MEP equipment-schedule data extracted from construction bid packages, plus a user question.

Your job: answer the question by returning **ONLY a single JSON object** matching this TypeScript shape (no prose, no markdown fences, no commentary):

{
  "title": string,                 // chart title
  "type": "bar" | "hbar" | "pie" | "line" | "table" | "kpi",
  "explanation": string,           // 1-3 sentence plain-English answer
  "data": Array<Record<string, any>>,
  "categoryKey"?: string,          // for bar/hbar/pie/line: the field on each data row that holds the category label
  "valueKey"?: string,             // for bar/hbar/pie/line: the numeric field
  "series"?: string[],             // optional: multiple numeric fields for grouped/multi-series charts
  "xLabel"?: string,
  "yLabel"?: string,
  "columns"?: Array<{ "key": string, "header": string }> // for table type only
}

Rules:
- Compute aggregates yourself from the JSON given to you. Do NOT make up values.
- If the data cannot answer the question, return type "kpi" with an explanation that says so and data: [].
- Prefer "hbar" for ranking lots of categories. Use "bar" for <=10 categories. Use "pie" only when showing share of a whole. Use "line" for time series. Use "table" when the answer needs multiple columns.
- Limit "data" to at most 25 rows; sort meaningful descending.
- Keep "explanation" short and direct.
- Output JSON ONLY.`;

async function callAnthropic(
  apiKey: string,
  question: string,
  contextJson: string,
  model: string
) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Dataset JSON:\n\`\`\`json\n${contextJson}\n\`\`\`\n\nQuestion: ${question}\n\nReturn ONLY the JSON chart spec.`,
        },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${t}`);
  }
  const json: any = await resp.json();
  const text =
    json?.content?.[0]?.text ||
    json?.content?.map((c: any) => c?.text).join("") ||
    "";
  return text as string;
}

async function callOpenAI(
  apiKey: string,
  question: string,
  contextJson: string,
  model: string
) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Dataset JSON:\n\`\`\`json\n${contextJson}\n\`\`\`\n\nQuestion: ${question}\n\nReturn ONLY the JSON chart spec.`,
        },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI ${resp.status}: ${t}`);
  }
  const json: any = await resp.json();
  return (json?.choices?.[0]?.message?.content || "") as string;
}

function extractJson(s: string): ChartSpec {
  // strip markdown fences if any
  const cleaned = s.replace(/^\s*```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  // find the first { ... } block
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(candidate);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, question } = body as {
      provider: "anthropic" | "openai";
      apiKey: string;
      model?: string;
      question: string;
    };
    // Fall back to server-side env keys if the client didn't supply one
    const effectiveKey =
      apiKey ||
      (provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY) ||
      "";
    if (!effectiveKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }
    const contextJson = JSON.stringify(datasetSummary);

    let raw: string;
    if (provider === "openai") {
      raw = await callOpenAI(
        effectiveKey,
        question,
        contextJson,
        model || "gpt-4o-mini"
      );
    } else {
      raw = await callAnthropic(
        effectiveKey,
        question,
        contextJson,
        model || "claude-opus-4-7"
      );
    }

    let spec: ChartSpec;
    try {
      spec = extractJson(raw);
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Could not parse model output as JSON",
          raw,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ spec, raw });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
