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
  Treemap,
  XAxis,
  YAxis,
} from "recharts";

const BV_BLUE = "#4A3AFF";
const BV_BLUE_LIGHT = "#7383FF";
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

export function HBarChart({
  data,
  height = 360,
  color = BV_BLUE,
}: {
  data: Array<{ key: string; count: number }>;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 24, top: 8, bottom: 8 }}
        >
          <CartesianGrid stroke="#EDEDED" horizontal={false} />
          <XAxis
            type="number"
            stroke="#8C8C92"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="key"
            stroke="#535257"
            fontSize={12}
            width={170}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "#F8F8F8" }}
            formatter={(value: number) => [value, "Count"]}
          />
          <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VBarChart({
  data,
  height = 320,
  color = BV_BLUE_LIGHT,
}: {
  data: Array<{ key: string; count: number }>;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ left: 8, right: 16, top: 8, bottom: 50 }}
        >
          <CartesianGrid stroke="#EDEDED" vertical={false} />
          <XAxis
            dataKey="key"
            stroke="#535257"
            fontSize={11}
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8C8C92"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8F8F8" }} />
          <Bar dataKey="count" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  height = 280,
}: {
  data: Array<{ date: string; count: number }>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="#EDEDED" />
          <XAxis
            dataKey="date"
            stroke="#535257"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8C8C92"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={BV_BLUE}
            strokeWidth={2}
            dot={{ r: 3, fill: BV_BLUE }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  height = 280,
}: {
  data: Array<{ key: string; count: number }>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="key"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((_, i) => (
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

export function StackedBarChart({
  data,
  series,
  height = 320,
  colors = BV_PALETTE,
}: {
  data: Array<Record<string, any>>;
  series: Array<{ key: string; name: string }>;
  height?: number;
  colors?: string[];
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 24, top: 8, bottom: 8 }}
          barCategoryGap="20%"
        >
          <CartesianGrid stroke="#EDEDED" horizontal={false} />
          <XAxis
            type="number"
            stroke="#8C8C92"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="key"
            stroke="#535257"
            fontSize={12}
            width={170}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8F8F8" }} />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              color: "#535257",
            }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={colors[i % colors.length]}
              stackId="x"
              radius={
                i === series.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryTreemap({
  data,
  height = 360,
  colors = BV_PALETTE,
}: {
  data: Array<{ name: string; value: number; children?: any[] }>;
  height?: number;
  colors?: string[];
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          stroke="#FFFFFF"
          fill={colors[0]}
          content={<TreemapContent colors={colors} />}
        >
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _n, props: any) => [
              value,
              props?.payload?.name || "Items",
            ]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

function TreemapContent({
  root,
  depth,
  x,
  y,
  width,
  height,
  index,
  payload,
  colors,
  rank,
  name,
  value,
}: any) {
  const fill = colors[index % colors.length];
  const labelFits = width > 70 && height > 28;
  const valueFits = width > 70 && height > 44;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "#FFFFFF",
          strokeWidth: 2,
          opacity: 0.92,
        }}
      />
      {labelFits && (
        <text
          x={x + 8}
          y={y + 18}
          fill="#FFFFFF"
          fontSize={12}
          fontFamily="Inter, sans-serif"
          fontWeight={700}
        >
          {name}
        </text>
      )}
      {valueFits && (
        <text
          x={x + 8}
          y={y + 36}
          fill="#FFFFFF"
          fontSize={11}
          fontFamily="Inter, sans-serif"
          opacity={0.85}
        >
          {value}
        </text>
      )}
    </g>
  );
}

/**
 * A simple HTML/CSS heatmap — manufacturers (rows) × categories (columns).
 * Each cell is shaded by intensity within its column (% of column total).
 */
export function ShareHeatmap({
  rows,
  cols,
  values,
  totals,
  rowHrefBase,
}: {
  rows: string[];
  cols: string[];
  /** values[rowIdx][colIdx] = count */
  values: number[][];
  /** column totals (denominator for % share). length === cols.length */
  totals: number[];
  rowHrefBase?: string;
}) {
  const max = (() => {
    let m = 0;
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < cols.length; c++) {
        const v = values[r]?.[c] || 0;
        const pct = totals[c] ? v / totals[c] : 0;
        if (pct > m) m = pct;
      }
    return m || 1;
  })();

  const colorFor = (count: number, colTotal: number) => {
    if (!count || !colTotal) return "transparent";
    const pct = count / colTotal;
    const intensity = Math.min(1, pct / max);
    // ramp from very light blue to BV blue
    // BV_BLUE = #4A3AFF -> rgb(74,58,255)
    const r = Math.round(255 - intensity * (255 - 74));
    const g = Math.round(255 - intensity * (255 - 58));
    const b = Math.round(255 - intensity * (255 - 255));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const fontFor = (count: number, colTotal: number) => {
    const pct = colTotal ? count / colTotal : 0;
    return pct > 0.4 ? "#FFFFFF" : "#2A2A2F";
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-detail">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white p-2 text-left text-micro font-bold uppercase tracking-wide text-neutral-500">
              Manufacturer ↓ / Category →
            </th>
            {cols.map((c, ci) => (
              <th
                key={c}
                className="px-2 py-2 text-left text-micro font-bold uppercase tracking-wide text-neutral-500"
                style={{ minWidth: 90 }}
              >
                <div>{c}</div>
                <div className="font-normal lowercase text-neutral-400">
                  n={totals[ci]}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row} className="border-t border-neutral-100">
              <td className="sticky left-0 z-10 bg-white px-2 py-1.5 font-bold text-neutral-800">
                {rowHrefBase ? (
                  <a
                    href={`${rowHrefBase}${encodeURIComponent(
                      row.toLowerCase().replace(/\s+/g, "-")
                    )}`}
                    className="hover:text-bv-blue-400"
                  >
                    {row}
                  </a>
                ) : (
                  row
                )}
              </td>
              {cols.map((c, ci) => {
                const v = values[ri]?.[ci] || 0;
                const total = totals[ci] || 0;
                const pct = total ? Math.round((v / total) * 100) : 0;
                return (
                  <td
                    key={c}
                    className="px-2 py-1.5 text-center"
                    style={{
                      backgroundColor: colorFor(v, total),
                      color: fontFor(v, total),
                      minWidth: 70,
                    }}
                    title={`${row} · ${c}: ${v}${
                      total ? ` (${pct}% of ${total})` : ""
                    }`}
                  >
                    {v > 0 ? v : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const BV_COLORS = BV_PALETTE;
