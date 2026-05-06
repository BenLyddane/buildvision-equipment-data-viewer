import { equipment, projects } from "@/data/load";
import {
  Badge,
  Card,
  PageTitle,
  SectionTitle,
  StatCard,
} from "@/components/ui";
import { HBarChart } from "@/components/charts";
import { HvacFocusTable } from "./hvac-focus-table";

export const metadata = {
  title: "RTU · DOAS · ERU · BuildVision Data Viewer",
};

type Focus = {
  key: "rtu" | "doas" | "eru";
  label: string;
  canonical: string;
  description: string;
};

const FOCUSES: Focus[] = [
  {
    key: "rtu",
    label: "Packaged Rooftop Units",
    canonical: "Packaged Rooftop Unit",
    description:
      "Packaged Rooftop Air-Conditioning Units (RTUs), DX-cooling/gas-heat or heat-pump variants.",
  },
  {
    key: "doas",
    label: "Dedicated Outdoor-Air Units (DOAS)",
    canonical: "Dedicated Outdoor-Air Unit (DOAS)",
    description:
      "Dedicated Outdoor-Air Units / Dedicated Outdoor Air Systems used for ventilation.",
  },
  {
    key: "eru",
    label: "Energy Recovery Units",
    canonical: "Energy Recovery Unit",
    description:
      "Energy Recovery Units / wheels — heat or enthalpy recovery between supply and exhaust air.",
  },
];

function formatNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function HvacFocusPage() {
  const projById = new Map(projects.map((p) => [p.id, p.name]));

  // Categorize equipment using the canonical type from the build pipeline
  const buckets = FOCUSES.map((f) => ({
    focus: f,
    items: equipment
      .filter((e) => e.canonicalType === f.canonical)
      .map((e) => ({ ...e, projectName: projById.get(e.projectId) || e.projectId })),
  }));

  // Aggregate stats
  const summaries = buckets.map(({ focus, items }) => {
    const manuMap = new Map<string, number>();
    const bodMap = new Map<string, number>();
    const projSet = new Set<string>();
    let bodMatches = 0;
    let bodMismatches = 0;
    let bodMissing = 0;
    for (const e of items) {
      projSet.add(e.projectId);
      if (e.manufacturer)
        manuMap.set(e.manufacturer, (manuMap.get(e.manufacturer) || 0) + 1);
      if (e.bodManufacturer)
        bodMap.set(
          e.bodManufacturer,
          (bodMap.get(e.bodManufacturer) || 0) + 1
        );
      if (e.bodManufacturer && e.manufacturer) {
        const norm = (s: string) => s.trim().toLowerCase();
        if (norm(e.bodManufacturer) === norm(e.manufacturer)) bodMatches++;
        else bodMismatches++;
      } else if (e.bodManufacturer || e.manufacturer) {
        bodMissing++;
      }
    }
    const top = (m: Map<string, number>) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([key, count]) => ({ key, count }));
    const totalBod = bodMatches + bodMismatches;
    const matchRate =
      totalBod > 0 ? Math.round((bodMatches / totalBod) * 100) : 0;
    return {
      focus,
      items,
      total: items.length,
      projectCount: projSet.size,
      manufacturerCount: manuMap.size,
      topManufacturers: top(manuMap),
      topBod: top(bodMap),
      bodMatches,
      bodMismatches,
      bodMissing,
      matchRate,
    };
  });

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="HVAC Focus"
        title="RTUs, DOAS & Energy Recovery"
        description="A focused view on three of the most strategic HVAC categories in the dataset: Packaged Rooftop Units, Dedicated Outdoor-Air Units, and Energy Recovery Units. Click any equipment row to expand its full specifications."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaries.map((s) => (
          <Card key={s.focus.key}>
            <p className="mb-1 text-detail font-bold uppercase tracking-wide text-bv-blue-400">
              {s.focus.label}
            </p>
            <p className="text-h4 font-bold text-neutral-900">
              {formatNum(s.total)}
            </p>
            <p className="text-detail text-neutral-500">
              items · {s.manufacturerCount} mfrs · {s.projectCount} projects
            </p>
          </Card>
        ))}
      </section>

      {summaries.map((s) => (
        <section key={s.focus.key} className="space-y-6">
          <div>
            <SectionTitle title={s.focus.label} />
            <p className="max-w-3xl text-detail text-neutral-500">
              {s.focus.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Items" value={s.total} accent="blue" />
            <StatCard label="Projects" value={s.projectCount} accent="purple" />
            <StatCard
              label="BOD match rate"
              value={`${s.matchRate}%`}
              hint={`${s.bodMatches}/${s.bodMatches + s.bodMismatches}`}
              accent="green"
            />
            <StatCard
              label="BOD mismatches"
              value={s.bodMismatches}
              hint={`${s.bodMissing} missing one`}
              accent="yellow"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-2 text-body-sm font-bold text-neutral-900">
                Top manufacturers (specified)
              </h3>
              {s.topManufacturers.length > 0 ? (
                <HBarChart data={s.topManufacturers} height={Math.max(200, s.topManufacturers.length * 32)} />
              ) : (
                <p className="text-detail text-neutral-500">
                  No manufacturer data.
                </p>
              )}
            </Card>
            <Card>
              <h3 className="mb-2 text-body-sm font-bold text-neutral-900">
                Top manufacturers (Basis of Design)
              </h3>
              {s.topBod.length > 0 ? (
                <HBarChart
                  data={s.topBod}
                  height={Math.max(200, s.topBod.length * 32)}
                  color="#CC98F6"
                />
              ) : (
                <p className="text-detail text-neutral-500">
                  No BOD data.
                </p>
              )}
            </Card>
          </div>

          <div>
            <h3 className="mb-3 text-body-sm font-bold text-neutral-900">
              Equipment ({formatNum(s.total)})
              <span className="ml-2 font-normal text-detail text-neutral-500">
                — click any row to view its full specifications
              </span>
            </h3>
            <HvacFocusTable rows={s.items} />
          </div>
        </section>
      ))}
    </div>
  );
}
