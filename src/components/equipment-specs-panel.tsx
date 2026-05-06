"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Requirement } from "@/data/types";

export function EquipmentSpecsPanel({
  equipmentId,
  preloaded,
}: {
  equipmentId: string;
  preloaded?: Requirement[];
}) {
  const [reqs, setReqs] = useState<Requirement[] | null>(preloaded ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloaded) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/equipment/${equipmentId}/specs`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setReqs((j.requirements as Requirement[]) || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Failed to load");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [equipmentId, preloaded]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-detail text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading specifications…
      </div>
    );
  }
  if (error) {
    return <p className="text-detail text-bv-red-400">{error}</p>;
  }
  if (!reqs?.length) {
    return (
      <p className="text-detail text-neutral-500">
        No specifications recorded for this equipment.
      </p>
    );
  }

  // Group by category
  const grouped = new Map<string, Requirement[]>();
  for (const r of reqs) {
    const k = r.category || "General";
    const arr = grouped.get(k) || [];
    arr.push(r);
    grouped.set(k, arr);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[...grouped.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, items]) => (
          <div
            key={category}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-detail font-bold text-neutral-900">
                {category}
              </h4>
              <Badge tone="neutral">{items.length}</Badge>
            </div>
            <dl className="divide-y divide-neutral-100">
              {items.map((r) => (
                <div
                  key={r.specId}
                  className="grid grid-cols-2 gap-3 py-1.5 text-detail"
                >
                  <dt className="text-neutral-500">{r.type || "—"}</dt>
                  <dd className="font-bold text-neutral-800">
                    {r.value || r.optionName || "—"}{" "}
                    {r.unit && (
                      <span className="font-normal text-neutral-500">
                        {r.unit}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
    </div>
  );
}
