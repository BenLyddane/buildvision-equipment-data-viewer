"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BV_PALETTE = [
  "#4A3AFF",
  "#7383FF",
  "#16DA7C",
  "#CC98F6",
  "#FFCC17",
  "#EC4343",
  "#3528BE",
  "#0B864B",
  "#6B21A8",
  "#CC9300",
];

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #C9CBCF",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  color: "#2A2A2F",
};

export type ChartSpec = {
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

export function NLChart({ spec }: { spec: ChartSpec }) {
  const cat = spec.categoryKey || "name";
  const val = spec.valueKey || "value";

  if (spec.type === "kpi" || !spec.data?.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-body-md text-neutral-700">{spec.explanation}</p>
      </div>
    );
  }

  if (spec.type === "table") {
    const cols =
      spec.columns ||
      Object.keys(spec.data[0] || {}).map((k) => ({ key: k, header: k }));
    return (
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-detail">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className="border-b border-neutral-200 px-4 py-3 text-left text-micro font-bold uppercase tracking-wide"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                {cols.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-neutral-800">
                    {String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (spec.type === "pie") {
    return (
      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={spec.data}
              dataKey={val}
              nameKey={cat}
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
            >
              {spec.data.map((_, i) => (
                <Cell key={i} fill={BV_PALETTE[i % BV_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: "#535257",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "line") {
    const series = spec.series || [val];
    return (
      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <LineChart data={spec.data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#EDEDED" />
            <XAxis dataKey={cat} stroke="#535257" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8C8C92" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif", color: "#535257" }} />
            {series.map((s, i) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={BV_PALETTE[i % BV_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "hbar") {
    const series = spec.series || [val];
    return (
      <div
        className="w-full"
        style={{ height: Math.max(220, spec.data.length * 30 + 40) }}
      >
        <ResponsiveContainer>
          <BarChart
            data={spec.data}
            layout="vertical"
            margin={{ left: 20, right: 24, top: 8, bottom: 8 }}
          >
            <CartesianGrid stroke="#EDEDED" horizontal={false} />
            <XAxis type="number" stroke="#8C8C92" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey={cat}
              stroke="#535257"
              fontSize={12}
              width={200}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8F8F8" }} />
            {series.length > 1 && (
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  color: "#535257",
                }}
              />
            )}
            {series.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                fill={BV_PALETTE[i % BV_PALETTE.length]}
                radius={[0, 6, 6, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // default: vertical bar
  const series = spec.series || [val];
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <BarChart data={spec.data} margin={{ left: 8, right: 16, top: 8, bottom: 50 }}>
          <CartesianGrid stroke="#EDEDED" vertical={false} />
          <XAxis
            dataKey={cat}
            stroke="#535257"
            fontSize={11}
            angle={-30}
            textAnchor="end"
            interval={0}
            height={70}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#8C8C92" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8F8F8" }} />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: "#535257",
              }}
            />
          )}
          {series.map((s, i) => (
            <Bar
              key={s}
              dataKey={s}
              fill={BV_PALETTE[i % BV_PALETTE.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
