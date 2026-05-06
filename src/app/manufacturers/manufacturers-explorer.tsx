"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";
import { manufacturerSlug } from "@/data/load";

type Row = {
  name: string;
  count: number;
  projectCount: number;
  componentTypeCount: number;
  topComponentTypes: Array<{ name: string; count: number }>;
  asBodCount: number;
};

export function ManufacturersExplorer({ rows }: { rows: Row[] }) {
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Manufacturer",
      sortable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <Link
          href={`/manufacturers/${manufacturerSlug(r.name)}`}
          className="font-bold text-neutral-900 hover:text-bv-blue-400"
        >
          {r.name}
        </Link>
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
      key: "componentTypeCount",
      header: "Comp. Types",
      sortable: true,
      accessor: (r) => r.componentTypeCount,
      render: (r) => <span>{r.componentTypeCount}</span>,
      width: "120px",
    },
    {
      key: "topComponentTypes",
      header: "Top Categories",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.topComponentTypes.map((t) => (
            <Badge key={t.name} tone="purple">
              {t.name} · {t.count}
            </Badge>
          ))}
          {r.topComponentTypes.length === 0 && (
            <span className="text-neutral-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: "asBodCount",
      header: "As BOD",
      sortable: true,
      accessor: (r) => r.asBodCount,
      render: (r) =>
        r.asBodCount > 0 ? (
          <Badge tone="yellow">{r.asBodCount}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
      width: "100px",
    },
  ];
  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKeys={["name"]}
      searchPlaceholder="Search manufacturers…"
      pageSize={30}
    />
  );
}
