"use client";

import Link from "next/link";
import type { ProjectSummary } from "@/data/types";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";

type Row = ProjectSummary & { createdAtMs: number };

export function ProjectsTable({ projects }: { projects: Row[] }) {
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Project",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <Link
          href={`/projects/${r.id}`}
          className="font-bold text-neutral-900 hover:text-bv-blue-400"
        >
          {r.name || "Untitled"}
        </Link>
      ),
    },
    {
      key: "equipmentCount",
      header: "Equipment",
      sortable: true,
      accessor: (r) => r.equipmentCount,
      render: (r) => (
        <span className="font-bold text-neutral-800">
          {r.equipmentCount.toLocaleString()}
        </span>
      ),
      width: "120px",
    },
    {
      key: "packageCount",
      header: "Packages",
      sortable: true,
      accessor: (r) => r.packageCount,
      render: (r) => <span>{r.packageCount}</span>,
      width: "110px",
    },
    {
      key: "componentTypeCount",
      header: "Comp. Types",
      sortable: true,
      accessor: (r) => r.componentTypeCount,
      render: (r) => <span>{r.componentTypeCount}</span>,
      width: "130px",
    },
    {
      key: "manufacturerCount",
      header: "Manufacturers",
      sortable: true,
      accessor: (r) => r.manufacturerCount,
      render: (r) => (
        <Badge tone="blue">{r.manufacturerCount.toLocaleString()}</Badge>
      ),
      width: "140px",
    },
    {
      key: "createdAtMs",
      header: "Created",
      sortable: true,
      accessor: (r) => r.createdAtMs,
      render: (r) =>
        r.createdAt ? (
          <span className="text-neutral-600">
            {new Date(r.createdAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
      width: "120px",
    },
  ];

  return (
    <DataTable
      data={projects}
      columns={columns}
      searchKeys={["name"]}
      searchPlaceholder="Search projects by name…"
      pageSize={25}
    />
  );
}
