"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";
import { specTypeSlug } from "@/data/spec-types";

type Row = {
  type: string;
  count: number;
  distinctEquipment: number;
  isNumeric: boolean;
  topUnit: string | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  sampleCount: number;
  sampleValue: string | null;
};

function fmt(n: number | null | undefined, digits = 1) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function SpecTypesExplorer({ rows }: { rows: Row[] }) {
  const columns: Column<Row>[] = [
    {
      key: "type",
      header: "Spec type",
      sortable: true,
      accessor: (r) => r.type,
      render: (r) => (
        <Link
          href={`/spec-types/${specTypeSlug(r.type)}`}
          className="font-bold text-neutral-900 hover:text-bv-blue-400"
        >
          {r.type}
        </Link>
      ),
    },
    {
      key: "count",
      header: "Rows",
      sortable: true,
      accessor: (r) => r.count,
      render: (r) => <span className="font-bold">{r.count.toLocaleString()}</span>,
      width: "100px",
    },
    {
      key: "distinctEquipment",
      header: "On equipment",
      sortable: true,
      accessor: (r) => r.distinctEquipment,
      render: (r) => <span>{r.distinctEquipment.toLocaleString()}</span>,
      width: "120px",
    },
    {
      key: "isNumeric",
      header: "Kind",
      sortable: true,
      accessor: (r) => (r.isNumeric ? "numeric" : "text"),
      render: (r) =>
        r.isNumeric ? (
          <Badge tone="blue">numeric</Badge>
        ) : (
          <Badge tone="purple">text</Badge>
        ),
      width: "100px",
    },
    {
      key: "topUnit",
      header: "Unit",
      sortable: true,
      accessor: (r) => r.topUnit || "",
      render: (r) =>
        r.topUnit ? (
          <span className="font-mono text-neutral-700">{r.topUnit}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
      width: "100px",
    },
    {
      key: "range",
      header: "Range",
      sortable: false,
      render: (r) =>
        r.isNumeric && r.min != null && r.max != null ? (
          <span className="font-mono text-detail text-neutral-700">
            {fmt(r.min)} – {fmt(r.max)}
          </span>
        ) : r.sampleValue ? (
          <span className="text-neutral-700">
            e.g. <span className="font-bold">{r.sampleValue}</span>
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "avg",
      header: "Average",
      sortable: true,
      accessor: (r) => r.avg ?? -Infinity,
      render: (r) =>
        r.avg != null ? (
          <span className="font-mono text-neutral-700">{fmt(r.avg, 2)}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
      width: "120px",
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKeys={["type", "topUnit", "sampleValue"]}
      searchPlaceholder="Search spec types (e.g. CFM, MBH, Voltage…)"
      pageSize={50}
    />
  );
}
