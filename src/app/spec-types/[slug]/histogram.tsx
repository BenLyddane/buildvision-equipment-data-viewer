"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #C9CBCF",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  color: "#2A2A2F",
};

export function ValueHistogram({
  specType,
  min,
  max,
  bins = 12,
}: {
  specType: string;
  min: number;
  max: number;
  bins?: number;
}) {
  const [data, setData] = useState<Array<{ bucket: string; count: number }>>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/spec-type-values?type=${encodeURIComponent(specType)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const values = (j.values || []) as number[];
        if (!values.length) {
          setData([]);
          return;
        }
        const lo = min;
        const hi = max;
        const span = hi - lo || 1;
        const step = span / bins;
        const counts = new Array(bins).fill(0);
        for (const v of values) {
          let idx = Math.floor((v - lo) / step);
          if (idx < 0) idx = 0;
          if (idx >= bins) idx = bins - 1;
          counts[idx]++;
        }
        const out = counts.map((c, i) => {
          const a = lo + i * step;
          const b = lo + (i + 1) * step;
          const fmt = (n: number) =>
            Math.abs(n) >= 100 ? Math.round(n).toString() : n.toFixed(1);
          return {
            bucket: `${fmt(a)}–${fmt(b)}`,
            count: c,
          };
        });
        setData(out);
      })
      .catch(() => setData([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [specType, min, max, bins]);

  if (loading) {
    return (
      <p className="text-detail text-neutral-500">Loading distribution…</p>
    );
  }
  if (!data.length) {
    return (
      <p className="text-detail text-neutral-500">
        Not enough numeric data to plot a distribution.
      </p>
    );
  }
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ left: 8, right: 16, top: 8, bottom: 50 }}
        >
          <CartesianGrid stroke="#EDEDED" vertical={false} />
          <XAxis
            dataKey="bucket"
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
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "#F8F8F8" }}
            formatter={(v: number) => [v, "count"]}
          />
          <Bar dataKey="count" fill="#4A3AFF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
