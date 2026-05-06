"use client";

import Link from "next/link";
import type { Equipment } from "@/data/types";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";
import { EquipmentSpecsPanel } from "@/components/equipment-specs-panel";

type Row = Equipment & { projectName: string };

export function HvacFocusTable({ rows }: { rows: Row[] }) {
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
      key: "manufacturer",
      header: "Specified",
      sortable: true,
      accessor: (r) => r.manufacturer || "",
      render: (r) => (
        <span className="font-bold text-neutral-800">
          {r.manufacturer || "—"}
        </span>
      ),
    },
    {
      key: "bodManufacturer",
      header: "BOD",
      sortable: true,
      accessor: (r) => r.bodManufacturer || "",
      render: (r) => {
        if (!r.bodManufacturer) return <span className="text-neutral-400">—</span>;
        const match =
          r.manufacturer &&
          r.bodManufacturer.trim().toLowerCase() ===
            r.manufacturer.trim().toLowerCase();
        return (
          <Badge tone={match ? "green" : "yellow"}>
            {r.bodManufacturer}
          </Badge>
        );
      },
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
      key: "projectName",
      header: "Project",
      sortable: true,
      accessor: (r) => r.projectName,
      render: (r) => (
        <Link
          href={`/projects/${r.projectId}`}
          className="text-neutral-700 hover:text-bv-blue-400"
        >
          {r.projectName}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKeys={[
        "tag",
        "manufacturer",
        "bodManufacturer",
        "componentModel",
        "componentTypeName",
        "projectName",
      ]}
      searchPlaceholder="Search tag, manufacturer, model…"
      pageSize={25}
      rowKey={(r) => r.id}
      renderExpanded={(r) => <EquipmentSpecsPanel equipmentId={r.id} />}
    />
  );
}
