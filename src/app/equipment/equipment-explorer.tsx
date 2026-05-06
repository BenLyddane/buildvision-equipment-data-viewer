"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Equipment } from "@/data/types";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui";

type Row = Equipment & { projectName: string };

function uniqueSorted(values: Array<string | null | undefined>) {
  const set = new Set<string>();
  for (const v of values) if (v) set.add(v);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function EquipmentExplorer({ rows }: { rows: Row[] }) {
  const manufacturers = useMemo(
    () => uniqueSorted(rows.map((r) => r.manufacturer)),
    [rows]
  );
  const componentTypes = useMemo(
    () => uniqueSorted(rows.map((r) => r.componentTypeName)),
    [rows]
  );
  const projectNames = useMemo(
    () => uniqueSorted(rows.map((r) => r.projectName)),
    [rows]
  );

  const [manu, setManu] = useState("");
  const [type, setType] = useState("");
  const [proj, setProj] = useState("");

  const filtered = useMemo(() => {
    return rows.filter(
      (r) =>
        (!manu || r.manufacturer === manu) &&
        (!type || r.componentTypeName === type) &&
        (!proj || r.projectName === proj)
    );
  }, [rows, manu, type, proj]);

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
      header: "Manufacturer",
      sortable: true,
      accessor: (r) => r.manufacturer || "",
      render: (r) => (
        <span className="font-bold text-neutral-800">
          {r.manufacturer || "—"}
        </span>
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Filter
          label="Manufacturer"
          value={manu}
          onChange={setManu}
          options={manufacturers}
        />
        <Filter
          label="Component Type"
          value={type}
          onChange={setType}
          options={componentTypes}
        />
        <Filter
          label="Project"
          value={proj}
          onChange={setProj}
          options={projectNames}
        />
        {(manu || type || proj) && (
          <button
            onClick={() => {
              setManu("");
              setType("");
              setProj("");
            }}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-detail text-neutral-600 hover:bg-neutral-50"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={[
          "tag",
          "manufacturer",
          "componentModel",
          "componentTypeName",
          "projectName",
        ]}
        searchPlaceholder="Search tag, manufacturer, model…"
        pageSize={50}
      />
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-micro font-bold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[180px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-detail text-neutral-800 focus:border-bv-blue-400 focus:outline-none focus:ring-2 focus:ring-bv-blue-100"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
