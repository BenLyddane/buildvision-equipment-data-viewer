import {
  Building2,
  Boxes,
  Factory,
  Layers,
  TrendingUp,
} from "lucide-react";
import { aggregates, projects } from "@/data/load";
import { Card, PageTitle, SectionTitle, StatCard, BVLink } from "@/components/ui";
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

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="Dashboard"
        title="Equipment data across all projects"
        description="High-level view of HVAC/MEP equipment schedules extracted from construction bid packages — projects, manufacturers, component types, and specifications at a glance."
      />

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
