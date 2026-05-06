import Link from "next/link";
import {
  aggregates,
  getProject,
  manufacturers,
  manufacturerSlug,
} from "@/data/load";
import {
  Badge,
  Card,
  PageTitle,
  SectionTitle,
  StatCard,
  BVLink,
} from "@/components/ui";
import {
  CategoryTreemap,
  DonutChart,
  HBarChart,
  ShareHeatmap,
  StackedBarChart,
} from "@/components/charts";

export const metadata = {
  title: "Insights · BuildVision Data Viewer",
};

export default function InsightsPage() {
  const { bod, marketShare, canonicalMarketShare, topBodManufacturers } =
    aggregates;
  const totalBod = bod.matches + bod.mismatches;
  const matchRate =
    totalBod > 0 ? Math.round((bod.matches / totalBod) * 100) : 0;

  // Treemap data: canonical category sizes
  const treemapData = canonicalMarketShare
    .filter((c) => c.totalSpecified >= 5)
    .slice(0, 22)
    .map((c) => ({ name: c.type, value: c.totalSpecified }));

  // Heatmap: top 12 manufacturers × top 12 canonical categories
  const heatTopMfr = manufacturers.slice(0, 12).map((m) => m.name);
  const heatTopCat = canonicalMarketShare
    .filter((c) => c.totalSpecified >= 20)
    .slice(0, 12);
  const heatRows = heatTopMfr;
  const heatCols = heatTopCat.map((c) => c.type);
  const heatTotals = heatTopCat.map((c) => c.totalSpecified);
  const heatValues = heatRows.map((mfr) => {
    const m = manufacturers.find((x) => x.name === mfr);
    if (!m) return heatCols.map(() => 0);
    return heatCols.map(
      (cat) => m.canonicalTypes.find((c) => c.name === cat)?.count || 0
    );
  });

  // Stacked bar: top 8 manufacturers BOD-Match vs BOD-Mismatch vs Spec-Only vs BOD-Only
  const stackData = manufacturers.slice(0, 10).map((m) => {
    const matched = m.bodMatchSelf;
    const lost = m.bodCount - m.bodMatchSelf; // BOD but specified=other
    const wonOrSpecOnly = m.count - m.bodMatchSelf; // specified but BOD wasn't us (or no BOD)
    return {
      key: m.name,
      "BOD held": matched,
      "BOD lost": lost,
      "Spec-only / won": wonOrSpecOnly,
    };
  });

  // Top substitution losers — manufacturers with most "BOD specified, but lost"
  const topLosers = [...manufacturers]
    .map((m) => ({
      name: m.name,
      lost: m.bodCount - m.bodMatchSelf,
      bodCount: m.bodCount,
      lossRate: m.bodCount ? (m.bodCount - m.bodMatchSelf) / m.bodCount : 0,
    }))
    .filter((x) => x.bodCount >= 10)
    .sort((a, b) => b.lossRate - a.lossRate)
    .slice(0, 10);

  // BOD donut: matches/mismatches/missing
  const bodDonut = [
    { key: "BOD = Specified", count: bod.matches },
    { key: "BOD ≠ Specified", count: bod.mismatches },
    { key: "Missing one side", count: bod.missing },
  ];

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="Insights"
        title="Patterns across the dataset"
        description="Cross-cutting analyses derived from the extracted equipment schedules: BOD vs. specified manufacturer alignment, manufacturer market share by canonical category, and competitive head-to-head dynamics."
      />

      {/* Canonical category map */}
      <section>
        <SectionTitle title="Canonical category map" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          The dataset's HVAC categories at a glance, after consolidating
          schedule-name variants. Block size = number of specified items.
        </p>
        <Card>
          <CategoryTreemap data={treemapData} height={420} />
        </Card>
      </section>

      {/* Manufacturer × Category Heatmap */}
      <section>
        <SectionTitle title="Manufacturer × category heatmap" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Which categories each top manufacturer plays in. Cell shading is
          relative share within each column. Hover for exact share.
        </p>
        <Card>
          <ShareHeatmap
            rows={heatRows}
            cols={heatCols}
            values={heatValues}
            totals={heatTotals}
            rowHrefBase="/manufacturers/"
          />
        </Card>
      </section>

      {/* BOD alignment */}
      <section>
        <SectionTitle title="Basis of Design alignment" />
        <p className="mb-6 max-w-3xl text-detail text-neutral-500">
          Every equipment item may carry a "Basis of Design" (BOD) manufacturer
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
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle title="Outcome breakdown" />
            <DonutChart data={bodDonut} height={300} />
          </Card>
          <Card>
            <SectionTitle title="Highest substitution-loss rate" />
            <p className="mb-3 text-detail text-neutral-500">
              Manufacturers whose BOD entries most often end up specified as a
              different brand (≥10 BOD entries).
            </p>
            <ul className="space-y-2">
              {topLosers.map((l) => {
                const pct = Math.round(l.lossRate * 100);
                return (
                  <li key={l.name}>
                    <div className="mb-1 flex items-center justify-between text-detail">
                      <BVLink
                        href={`/manufacturers/${manufacturerSlug(l.name)}`}
                        className="!text-neutral-800 font-bold !no-underline hover:!text-bv-blue-400"
                      >
                        {l.name}
                      </BVLink>
                      <span className="text-neutral-700">
                        {l.lost} / {l.bodCount}{" "}
                        <span className="font-bold">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-bv-yellow-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
              {topLosers.length === 0 && (
                <li className="text-detail text-neutral-500">
                  No high-volume substitution losers detected.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </section>

      {/* BOD outcome by top manufacturer */}
      <section>
        <SectionTitle title="BOD outcome by manufacturer" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Stacked composition of the top 10 manufacturers' line items: BOD
          held, BOD lost to a sub, and items where they won despite a different
          BOD (or had no BOD at all).
        </p>
        <Card>
          <StackedBarChart
            data={stackData}
            series={[
              { key: "BOD held", name: "BOD held" },
              { key: "BOD lost", name: "BOD lost to sub" },
              { key: "Spec-only / won", name: "Spec-only / won" },
            ]}
            height={420}
            colors={["#16DA7C", "#EC4343", "#7383FF"]}
          />
        </Card>
      </section>

      {/* Recent mismatches */}
      <section>
        <SectionTitle title="Recent BOD mismatches" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Examples where the engineer's basis of design and the actually
          specified manufacturer don't match.
        </p>
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
      </section>

      {/* Market share by canonical category */}
      <section>
        <SectionTitle title="Market share by canonical category" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Top manufacturers within the most-specified equipment categories
          (after canonical normalization).
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {canonicalMarketShare
            .filter((ms) => ms.totalSpecified >= 20)
            .slice(0, 8)
            .map((ms) => (
              <Card key={ms.type}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-body-sm font-bold text-neutral-900">
                    {ms.type}
                  </h3>
                  <Badge tone="neutral">
                    {ms.totalSpecified} specified
                  </Badge>
                </div>
                <HBarChart
                  data={ms.top.slice(0, 6)}
                  height={Math.max(180, Math.min(6, ms.top.length) * 36)}
                />
              </Card>
            ))}
        </div>
      </section>

      {/* Most-specified BOD */}
      <section>
        <SectionTitle title="Most-specified BOD manufacturers" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
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
