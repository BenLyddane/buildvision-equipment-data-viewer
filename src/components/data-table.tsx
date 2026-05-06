"use client";

import { ReactNode, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  className?: string;
  width?: string;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = "Search…",
  pageSize = 25,
  emptyText = "No matching rows.",
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: Array<keyof T | ((row: T) => string)>;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = data;
    if (query.trim() && searchKeys?.length) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => {
          const v =
            typeof k === "function"
              ? k(row)
              : (row[k as keyof T] as unknown as string | null | undefined);
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        const acc =
          col.accessor ||
          ((r: T) => (r as any)[sortKey] as string | number | null);
        rows = [...rows].sort((a, b) => {
          const av = acc(a);
          const bv = acc(b);
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (typeof av === "number" && typeof bv === "number") {
            return sortDir === "asc" ? av - bv : bv - av;
          }
          return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
        });
      }
    }
    return rows;
  }, [data, query, sortKey, sortDir, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div>
      {searchKeys?.length ? (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-detail text-neutral-800 placeholder:text-neutral-400 focus:border-bv-blue-400 focus:outline-none focus:ring-2 focus:ring-bv-blue-100"
            />
          </div>
          <span className="text-detail text-neutral-500">
            {filtered.length.toLocaleString()} results
          </span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-detail">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={clsx(
                    "border-b border-neutral-200 px-4 py-3 text-left font-bold uppercase tracking-wide text-micro",
                    c.sortable && "cursor-pointer select-none",
                    c.className
                  )}
                  style={c.width ? { width: c.width } : undefined}
                  onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {c.sortable && sortKey === c.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-detail text-neutral-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={clsx(
                        "px-4 py-3 align-middle text-neutral-800",
                        c.className
                      )}
                    >
                      {c.render
                        ? c.render(row)
                        : (() => {
                            const acc =
                              c.accessor ||
                              ((r: T) => (r as any)[c.key] as ReactNode);
                            return acc(row) as ReactNode;
                          })()}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-detail text-neutral-600">
          <span>
            Page {safePage + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-neutral-200 px-3 py-1.5 disabled:opacity-50"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
            >
              Previous
            </button>
            <button
              className="rounded-md border border-neutral-200 px-3 py-1.5 disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
