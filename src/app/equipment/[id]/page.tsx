import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  equipment,
  getEquipment,
  getProject,
  getRequirements,
} from "@/data/load";
import { Badge, Card, PageTitle } from "@/components/ui";

export function generateStaticParams() {
  // Pre-render the most-specified equipment to keep build time reasonable
  // while still giving fast detail pages for top items.
  return equipment.slice(0, 500).map((e) => ({ id: e.id }));
}

// Fall back to ISR/SSR for any non-prerendered equipment id.
export const dynamicParams = true;

export function generateMetadata({ params }: { params: { id: string } }) {
  const e = getEquipment(params.id);
  return {
    title: `${e?.tag || "Equipment"} · BuildVision Data Viewer`,
  };
}

export default function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = getEquipment(params.id);
  if (!item) return notFound();
  const project = getProject(item.projectId);
  const reqs = getRequirements(item.id);

  // Group requirements by category
  const grouped = new Map<string, typeof reqs>();
  for (const r of reqs) {
    const k = r.category || "General";
    const arr = grouped.get(k) || [];
    arr.push(r);
    grouped.set(k, arr);
  }

  return (
    <div className="space-y-10">
      <div>
        <Link
          href={project ? `/projects/${project.id}` : "/equipment"}
          className="mb-4 inline-flex items-center gap-1 text-detail text-neutral-500 hover:text-bv-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />{" "}
          {project ? `Back to ${project.name}` : "Back to equipment"}
        </Link>
        <PageTitle
          eyebrow={item.componentTypeName || "Equipment"}
          title={item.tag || item.componentName || "Equipment"}
          description={
            item.componentName && item.componentName !== item.tag
              ? item.componentName
              : undefined
          }
        />
        <div className="flex flex-wrap gap-2">
          {item.manufacturer && (
            <Badge tone="blue">Mfr: {item.manufacturer}</Badge>
          )}
          {item.bodManufacturer && (
            <Badge tone="purple">BOD: {item.bodManufacturer}</Badge>
          )}
          {item.componentModel && (
            <Badge tone="neutral">Model: {item.componentModel}</Badge>
          )}
          {item.packageName && (
            <Badge tone="yellow">Package: {item.packageName}</Badge>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-h5 font-bold text-neutral-900">
          Specifications ({reqs.length})
        </h2>
        {reqs.length === 0 ? (
          <Card>
            <p className="text-detail text-neutral-500">
              No specifications recorded for this equipment.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[...grouped.entries()]
              .sort((a, b) => b[1].length - a[1].length)
              .map(([category, items]) => (
                <Card key={category}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-body-sm font-bold text-neutral-900">
                      {category}
                    </h3>
                    <Badge tone="neutral">{items.length}</Badge>
                  </div>
                  <dl className="divide-y divide-neutral-100">
                    {items.map((r) => (
                      <div
                        key={r.specId}
                        className="grid grid-cols-2 gap-3 py-2 text-detail"
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
                </Card>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
