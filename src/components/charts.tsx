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

export const BV_COLORS = BV_PALETTE;
