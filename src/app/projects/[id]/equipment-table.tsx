"use client";

import Link from "next/link";
import type { Equipment } from "@/data/types";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";

type Row = Equipment & { specCount: number };

export function ProjectEquipmentTable({ rows }: { rows: Row[] }) {
  const columns: Column<Row>[] = [
    {
      key: "tag",
      header: "Tag",
      sortable: true,
      accessor: (r) => r.tag || "",
      render: (r) => (
        <Link
          href={`/equipment/${r.id}`}
          className="font-bold text-neutral-900 hover:text-bv-blue-400"
        >
          {r.tag || r.id.slice(0, 8)}
        </Link>
      ),
      width: "120px",
    },
    {
      key: "componentTypeName",
      header: "Component Type",
      sortable: true,
      accessor: (r) => r.componentTypeName || "",
      render: (r) =>
        r.componentTypeName ? (
          <Badge tone="blue">{r.componentTypeName}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "packageName",
      header: "Package",
      sortable: true,
      accessor: (r) => r.packageName || "",
      render: (r) => (
        <span className="text-neutral-600">{r.packageName || "—"}</span>
      ),
    },
    {
      key: "manufacturer",
      header: "Manufacturer",
      sortable: true,
      accessor: (r) => r.manufacturer || "",
      render: (r) =>
        r.manufacturer ? (
          <span className="font-bold text-neutral-800">{r.manufacturer}</span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "componentModel",
      header: "Model",
      sortable: true,
      accessor: (r) => r.componentModel || "",
      render: (r) => (
        <span className="text-neutral-600">{r.componentModel || "—"}</span>
      ),
    },
    {
      key: "specCount",
      header: "Specs",
      sortable: true,
      accessor: (r) => r.specCount,
      render: (r) => (
        <span className="text-neutral-600">{r.specCount}</span>
      ),
      width: "80px",
    },
  ];
  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKeys={[
        "tag",
        "componentTypeName",
        "packageName",
        "manufacturer",
        "componentModel",
      ]}
      searchPlaceholder="Search by tag, type, manufacturer, model…"
      pageSize={25}
    />
  );
}
