import {
  Building2,
  Boxes,
  Factory,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { aggregates, manufacturers, projects } from "@/data/load";
import { manufacturerSlug } from "@/data/load";
import { Badge, Card, PageTitle, SectionTitle, StatCard, BVLink } from "@/components/ui";
import { HBarChart, VBarChart, TimeSeriesChart } from "@/components/charts";

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function DashboardPage() {
  const { totals, topManufacturers, topComponentTypes, equipmentByProject } =
    aggregates;

  // Projects-over-time: bucket by month from createdAt
  const monthBuckets = new Map<string, number>();
  for (const p of projects) {
    if (!p.createdAt) continue;
    const d = new Date(p.createdAt);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets.set(key, (monthBuckets.get(key) || 0) + 1);
  }
  const timeSeries = [...monthBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Equipment per project (top 15)
  const projById = new Map(projects.map((p) => [p.id, p]));
  const equipmentChart = equipmentByProject.slice(0, 12).map((row) => ({
    key: (projById.get(row.projectId)?.name || row.projectId).slice(0, 28),
    count: row.count,
  }));

  // ---- Vendor Spotlight ----
  // Spotlight Greenheck (BuildVision's client). Falls back to the largest
  // BOD-footprint manufacturer if Greenheck isn't in the dataset.
  const spotlight =
    manufacturers.find((m) => m.name === "Greenheck") || manufacturers[0];
  const spotlightProjectCoverage = spotlight
    ? Math.round((spotlight.projectCount / totals.projects) * 100)
    : 0;
  const spotlightWhitespaceCount = spotlight
    ? totals.projects - spotlight.projectCount
    : 0;
  const spotlightWinPct =
    spotlight && spotlight.winRate != null
      ? Math.round(spotlight.winRate * 100)
      : null;
  const spotlightTopCanonical = spotlight?.canonicalTypes.slice(0, 5) || [];

  // ---- Category Competitive Set: top 5 canonical categories by total ----
  const competitive = aggregates.canonicalMarketShare
    .filter((c) => c.totalSpecified >= 25)
    .slice(0, 6);

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="Dashboard"
        title="Equipment data across all projects"
        description="High-level view of HVAC/MEP equipment schedules extracted from construction bid packages — projects, manufacturers, component types, and specifications at a glance."
      />

      {/* Vendor Spotlight */}
      {spotlight && (
        <section>
          <Card className="border-bv-blue-300 bg-gradient-to-br from-bv-blue-100 to-white">
            <div className="flex items-center gap-2 text-detail font-bold uppercase tracking-wide text-bv-blue-400">
              <Sparkles className="h-4 w-4" />
              Vendor Spotlight
            </div>
            <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <p className="text-h2 font-bold leading-tight text-neutral-900">
                  {spotlight.name}
                </p>
                <p className="mt-1 text-detail font-bold uppercase tracking-wide text-bv-purple-700">
                  Client
                </p>
                <p className="mt-2 text-body-sm text-neutral-700">
                  Specified <span className="font-bold">{spotlight.count}</span>{" "}
                  times across{" "}
                  <span className="font-bold">
                    {spotlight.projectCount} of {totals.projects} projects
                  </span>{" "}
                  ({spotlightProjectCoverage}% coverage)
                  {spotlightWinPct != null && (
                    <>
                      , with a{" "}
                      <span className="font-bold">
                        {spotlightWinPct}% BOD-to-spec retention rate
                      </span>{" "}
                      on {spotlight.bodCount} basis-of-design line items.
                    </>
                  )}
                </p>
                <p className="mt-2 text-detail text-neutral-600">
                  {spotlightWhitespaceCount > 0 && (
                    <>
                      Whitespace: <span className="font-bold">{spotlightWhitespaceCount} projects</span> in this
                      corpus do not specify them at all.
                    </>
                  )}
                </p>
                <BVLink
                  href={`/manufacturers/${manufacturerSlug(spotlight.name)}`}
                  className="mt-4 inline-flex items-center gap-1 text-detail font-bold"
                >
                  Open vendor deep-dive →
                </BVLink>
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  label="Specified"
                  value={spotlight.count}
                  hint="line items"
                  accent="blue"
                />
                <StatCard
                  label="Basis of Design"
                  value={spotlight.bodCount}
                  hint="BOD entries"
                  accent="purple"
                />
                <StatCard
                  label="BOD win rate"
                  value={spotlightWinPct != null ? `${spotlightWinPct}%` : "—"}
                  hint={`${spotlight.bodMatchSelf}/${spotlight.bodCount} held`}
                  accent="green"
                />
                <StatCard
                  label="Project coverage"
                  value={`${spotlightProjectCoverage}%`}
                  hint={`${spotlight.projectCount}/${totals.projects} projects`}
                  accent="yellow"
                />
                {spotlightTopCanonical.length > 0 && (
                  <div className="md:col-span-4">
                    <p className="mb-1 text-micro font-bold uppercase tracking-wide text-neutral-500">
                      Top categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {spotlightTopCanonical.map((c) => (
                        <Badge key={c.name} tone="blue">
                          {c.name} · {c.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label="Projects"
          value={formatNumber(totals.projects)}
          hint="Bid packages"
          accent="blue"
        />
        <StatCard
          label="Equipment"
          value={formatNumber(totals.equipment)}
          hint="Tagged items"
          accent="purple"
        />
        <StatCard
          label="Specifications"
          value={formatNumber(totals.requirements)}
          hint="Spec rows"
          accent="green"
        />
        <StatCard
          label="Manufacturers"
          value={formatNumber(totals.uniqueManufacturers)}
          hint="Unique brands"
          accent="yellow"
        />
        <StatCard
          label="Component Types"
          value={formatNumber(totals.uniqueComponentTypes)}
          hint="Categories"
          accent="blue"
        />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle
            title="Top manufacturers"
            action={
              <BVLink href="/manufacturers" className="text-detail font-bold">
                View all →
              </BVLink>
            }
          />
          <p className="mb-4 text-detail text-neutral-500">
            By number of equipment items specified.
          </p>
          <HBarChart data={topManufacturers.slice(0, 10)} />
        </Card>
        <Card>
          <SectionTitle
            title="Top component types"
            action={
              <BVLink href="/component-types" className="text-detail font-bold">
                View all →
              </BVLink>
            }
          />
          <p className="mb-4 text-detail text-neutral-500">
            Most common categories of equipment found in schedules.
          </p>
          <HBarChart
            data={topComponentTypes.slice(0, 10)}
            color="#7383FF"
          />
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Equipment per project" />
          <p className="mb-4 text-detail text-neutral-500">
            Top 12 projects by equipment count.
          </p>
          <VBarChart data={equipmentChart} />
        </Card>
        <Card>
          <SectionTitle title="Projects over time" />
          <p className="mb-4 text-detail text-neutral-500">
            Projects added per month.
          </p>
          {timeSeries.length > 0 ? (
            <TimeSeriesChart data={timeSeries} />
          ) : (
            <p className="text-detail text-neutral-500">
              No date data available.
            </p>
          )}
        </Card>
      </section>

      {/* Category Competitive Set */}
      {competitive.length > 0 && (
        <section>
          <SectionTitle
            title="Category competitive set"
            action={
              <BVLink href="/insights" className="text-detail font-bold">
                Full insights →
              </BVLink>
            }
          />
          <p className="mb-4 text-detail text-neutral-500">
            Who leads each canonical HVAC category, after consolidating
            schedule-name variants and normalizing manufacturer names.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {competitive.map((cat) => {
              const top3 = cat.top.slice(0, 3);
              const totalTop3 = top3.reduce((a, b) => a + b.count, 0);
              return (
                <Card key={cat.type}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className="text-body-sm font-bold text-neutral-900">
                      {cat.type}
                    </p>
                    <p className="text-detail text-neutral-500">
                      {cat.totalSpecified} specified
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {top3.map((m, i) => {
                      const pct =
                        cat.totalSpecified > 0
                          ? Math.round(
                              (m.count / cat.totalSpecified) * 100
                            )
                          : 0;
                      return (
                        <li key={m.key}>
                          <div className="mb-1 flex items-center justify-between text-detail">
                            <BVLink
                              href={`/manufacturers/${manufacturerSlug(m.key)}`}
                              className="!text-neutral-800 font-bold hover:!text-bv-blue-400 !no-underline"
                            >
                              {i + 1}. {m.key}
                            </BVLink>
                            <span className="font-bold text-neutral-700">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-bv-blue-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickLink
          href="/projects"
          icon={<Building2 className="h-5 w-5" />}
          title="Projects"
          desc="Browse all bid packages"
        />
        <QuickLink
          href="/equipment"
          icon={<Boxes className="h-5 w-5" />}
          title="Equipment"
          desc="Search every tagged item"
        />
        <QuickLink
          href="/manufacturers"
          icon={<Factory className="h-5 w-5" />}
          title="Manufacturers"
          desc="Brand frequency & coverage"
        />
        <QuickLink
          href="/insights"
          icon={<TrendingUp className="h-5 w-5" />}
          title="Insights"
          desc="BOD vs actual, market share"
        />
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <BVLink
      href={href}
      className="!text-neutral-800 !no-underline group block rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition hover:border-bv-blue-300 hover:bg-bv-blue-100"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-bv-blue-400 ring-1 ring-neutral-200 group-hover:bg-bv-blue-400 group-hover:text-white">
        {icon}
      </div>
      <p className="text-body-sm font-bold text-neutral-900">{title}</p>
      <p className="mt-1 text-detail text-neutral-600">{desc}</p>
    </BVLink>
  );
}
