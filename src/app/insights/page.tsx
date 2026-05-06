import Link from "next/link";
import { aggregates, getProject } from "@/data/load";
import { Badge, Card, PageTitle, SectionTitle, StatCard } from "@/components/ui";
import { HBarChart } from "@/components/charts";

export const metadata = {
  title: "Insights · BuildVision Data Viewer",
};

export default function InsightsPage() {
  const { bod, marketShare, topBodManufacturers } = aggregates;
  const totalBod = bod.matches + bod.mismatches;
  const matchRate =
    totalBod > 0 ? Math.round((bod.matches / totalBod) * 100) : 0;

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="Insights"
        title="Patterns across the dataset"
        description="Cross-cutting analyses derived from the extracted equipment schedules: BOD vs. specified manufacturer alignment, manufacturer market share by category, and more."
      />

      <section>
        <SectionTitle title="Basis of Design alignment" />
        <p className="mb-6 max-w-3xl text-detail text-neutral-500">
          Every equipment item may carry a “Basis of Design” (BOD) manufacturer
          set by the engineer alongside the actually specified manufacturer.
          When they differ, it usually indicates a substitution or post-design
          change.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Match rate"
            value={`${matchRate}%`}
            hint={`${bod.matches.toLocaleString()} / ${totalBod.toLocaleString()} items`}
            accent="green"
          />
          <StatCard
            label="Matches"
            value={bod.matches}
            hint="BOD = Specified"
            accent="green"
          />
          <StatCard
            label="Mismatches"
            value={bod.mismatches}
            hint="BOD ≠ Specified"
            accent="yellow"
          />
          <StatCard
            label="Missing one"
            value={bod.missing}
            hint="BOD or Mfr blank"
            accent="purple"
          />
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-body-md font-bold text-neutral-900">
            Recent mismatches
          </h3>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="min-w-full text-detail">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <Th>Component</Th>
                  <Th>BOD</Th>
                  <Th>Specified</Th>
                  <Th>Project</Th>
                </tr>
              </thead>
              <tbody>
                {bod.examples.map((ex) => (
                  <tr
                    key={ex.equipmentId}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2.5">
                      {ex.componentType ? (
                        <Badge tone="blue">{ex.componentType}</Badge>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">{ex.bod}</td>
                    <td className="px-4 py-2.5 font-bold text-neutral-900">
                      {ex.actual}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/projects/${ex.projectId}`}
                        className="text-bv-blue-400 hover:underline"
                      >
                        {getProject(ex.projectId)?.name || ex.projectId}
                      </Link>
                    </td>
                  </tr>
                ))}
                {bod.examples.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      No mismatches detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle title="Manufacturer market share by component type" />
        <p className="mb-6 max-w-3xl text-detail text-neutral-500">
          Top manufacturers within the most-specified equipment categories.
          Useful for understanding where each brand competes.
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {marketShare.map((ms) => (
            <Card key={ms.type}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-body-sm font-bold text-neutral-900">
                  {ms.type}
                </h3>
                <Badge tone="neutral">{ms.total} items</Badge>
              </div>
              <HBarChart data={ms.top} height={Math.max(180, ms.top.length * 32)} />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Most-specified BOD manufacturers" />
        <p className="mb-6 max-w-3xl text-detail text-neutral-500">
          Brands that engineers most frequently set as the basis of design.
        </p>
        <Card>
          <HBarChart data={topBodManufacturers.slice(0, 12)} color="#CC98F6" />
        </Card>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-neutral-200 px-4 py-3 text-left text-micro font-bold uppercase tracking-wide">
      {children}
    </th>
  );
}
