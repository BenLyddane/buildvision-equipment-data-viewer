"use client";

import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";

type Row = {
  name: string;
  count: number;
  manufacturerCount: number;
  projectCount: number;
  topManufacturers: Array<{ name: string; count: number }>;
};

export function ComponentTypesExplorer({ rows }: { rows: Row[] }) {
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Component Type",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <span className="font-bold text-neutral-900">{r.name}</span>
      ),
    },
    {
      key: "count",
      header: "Items",
      sortable: true,
      accessor: (r) => r.count,
      render: (r) => (
        <span className="font-bold text-neutral-800">
          {r.count.toLocaleString()}
        </span>
      ),
      width: "100px",
    },
    {
      key: "projectCount",
      header: "Projects",
      sortable: true,
      accessor: (r) => r.projectCount,
      render: (r) => <Badge tone="blue">{r.projectCount}</Badge>,
      width: "110px",
    },
    {
      key: "manufacturerCount",
      header: "Mfr. count",
      sortable: true,
      accessor: (r) => r.manufacturerCount,
      render: (r) => <span>{r.manufacturerCount}</span>,
      width: "120px",
    },
    {
      key: "topManufacturers",
      header: "Top Manufacturers",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.topManufacturers.map((m) => (
            <Badge key={m.name} tone="purple">
              {m.name} · {m.count}
            </Badge>
          ))}
          {r.topManufacturers.length === 0 && (
            <span className="text-neutral-400">—</span>
          )}
        </div>
      ),
    },
  ];
  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKeys={["name"]}
      searchPlaceholder="Search component types…"
      pageSize={30}
    />
  );
}
