import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  manufacturers,
  manufacturerFromSlug,
  manufacturerSlug,
  equipment,
  projects,
  aggregates,
} from "@/data/load";
import {
  Badge,
  BVLink,
  Card,
  PageTitle,
  SectionTitle,
  StatCard,
} from "@/components/ui";
import { HBarChart } from "@/components/charts";

export const dynamicParams = false;

export function generateStaticParams() {
  return manufacturers.map((m) => ({ name: manufacturerSlug(m.name) }));
}

export function generateMetadata({ params }: { params: { name: string } }) {
  const name = manufacturerFromSlug(params.name) || decodeURIComponent(params.name);
  return { title: `${name} · BuildVision Data Viewer` };
}

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export default function ManufacturerDeepDive({
  params,
}: {
  params: { name: string };
}) {
  const name = manufacturerFromSlug(params.name);
  if (!name) notFound();
  const m = manufacturers.find((x) => x.name === name);
  if (!m) notFound();

  const totals = aggregates.totals;
  const projectCoverage = pct(m.projectCount, totals.projects);
  const winPct = m.winRate != null ? Math.round(m.winRate * 100) : null;

  // Project coverage details
  const projById = new Map(projects.map((p) => [p.id, p]));
  const myEquipment = equipment.filter(
    (e) => e.manufacturer === name || e.bodManufacturer === name
  );
  const projStats = new Map<
    string,
    { specCount: number; bodCount: number }
  >();
  for (const e of myEquipment) {
    const s = projStats.get(e.projectId) || { specCount: 0, bodCount: 0 };
    if (e.manufacturer === name) s.specCount++;
    if (e.bodManufacturer === name) s.bodCount++;
    projStats.set(e.projectId, s);
  }

  // Whitespace = projects where neither spec nor BOD = this manufacturer
  const whitespaceProjects = projects
    .filter((p) => !projStats.has(p.id))
    .sort((a, b) => b.equipmentCount - a.equipmentCount);

  // Categories with share %
  const myCanonical = m.canonicalTypes.slice(0, 12);
  const canonicalShare = myCanonical.map((c) => {
    const totalInCat =
      aggregates.canonicalMarketShare.find((x) => x.type === c.name)?.totalSpecified || 0;
    return {
      name: c.name,
      count: c.count,
      share: pct(c.count, totalInCat),
      totalInCat,
    };
  });

  // Where we win the substitution: bodWonFrom (we replaced X)
  // Where we lose the substitution: bodLostTo (engineer specified Y instead of us)

  // Find the leader of the largest category we don't dominate
  const challengerCategory = canonicalShare.find(
    (c) => c.share < 50 && c.totalInCat >= 20
  );

  return (
    <div className="space-y-10">
      <PageTitle
        eyebrow={
          <span>
            <Link
              href="/manufacturers"
              className="text-bv-blue-400 hover:underline"
            >
              Manufacturers
            </Link>{" "}
            ·{" "}
            <span className="text-neutral-500">deep-dive</span>
          </span>
        }
        title={name}
        description={`Specified ${m.count} times across ${m.projectCount} of ${totals.projects} projects (${projectCoverage}% coverage). ${
          winPct != null
            ? `${winPct}% BOD-to-spec retention on ${m.bodCount} basis-of-design line items.`
            : ""
        }`}
      />

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Specified items"
          value={m.count}
          accent="blue"
          hint="Across all projects"
        />
        <StatCard
          label="Basis of Design"
          value={m.bodCount}
          accent="purple"
          hint="Times listed as BOD"
        />
        <StatCard
          label="BOD win rate"
          value={winPct != null ? `${winPct}%` : "—"}
          accent="green"
          hint={`${m.bodMatchSelf}/${m.bodCount} retained`}
        />
        <StatCard
          label="Project coverage"
          value={`${projectCoverage}%`}
          accent="yellow"
          hint={`${m.projectCount}/${totals.projects} projects`}
        />
      </section>

      {/* Headline insight */}
      <Card className="border-bv-blue-300 bg-bv-blue-100">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-bv-blue-400" />
          <div className="space-y-2 text-body-sm text-neutral-800">
            <p>
              <span className="font-bold">Stickiness:</span>{" "}
              {winPct != null && winPct >= 95 ? (
                <>
                  Engineers retain {name} on the spec line virtually every time
                  it's the BOD ({winPct}%). Substitutions are essentially absent
                  in this corpus.
                </>
              ) : winPct != null ? (
                <>
                  {name} is retained on the spec line {winPct}% of the time when
                  listed as the BOD. {m.bodCount - m.bodMatchSelf} of{" "}
                  {m.bodCount} BOD entries lost to substitutions.
                </>
              ) : (
                <>No BOD entries recorded for {name} in this corpus.</>
              )}
            </p>
            {challengerCategory && (
              <p>
                <span className="font-bold">Contested category:</span>{" "}
                In {challengerCategory.name} they hold {challengerCategory.share}% of{" "}
                {challengerCategory.totalInCat} specified items — the only
                top-tier category where they aren't already dominant.
              </p>
            )}
            {whitespaceProjects.length > 0 && (
              <p>
                <span className="font-bold">Whitespace:</span>{" "}
                {whitespaceProjects.length} of {totals.projects} projects in
                this dataset have <em>zero</em> {name} presence — neither spec
                nor BOD. Top targets:{" "}
                {whitespaceProjects
                  .slice(0, 5)
                  .map((p) => p.name)
                  .join("; ")}
                .
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Category mix */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Category mix (specified)" />
          <p className="mb-3 text-detail text-neutral-500">
            Which canonical HVAC categories {name} is specified in.
          </p>
          {myCanonical.length > 0 ? (
            <HBarChart
              data={myCanonical.map((c) => ({ key: c.name, count: c.count }))}
              height={Math.max(200, myCanonical.length * 30)}
            />
          ) : (
            <p className="text-detail text-neutral-500">No data.</p>
          )}
        </Card>
        <Card>
          <SectionTitle title="Share within each category" />
          <p className="mb-3 text-detail text-neutral-500">
            % of items in each category specified as {name}.
          </p>
          <ul className="space-y-3">
            {canonicalShare.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-center justify-between text-detail">
                  <span className="font-bold text-neutral-800">{c.name}</span>
                  <span className="text-neutral-700">
                    {c.count} / {c.totalInCat}{" "}
                    <span className="font-bold">({c.share}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-bv-blue-400"
                    style={{ width: `${c.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* BOD dynamics */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title={`Lost the substitution to`} />
          <p className="mb-3 text-detail text-neutral-500">
            Times {name} was the BOD but a different manufacturer ended up
            specified.
          </p>
          {m.bodLostTo.length > 0 ? (
            <ul className="space-y-2">
              {m.bodLostTo.slice(0, 8).map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between rounded-md bg-bv-yellow-100 px-3 py-2 text-detail"
                >
                  <BVLink
                    href={`/manufacturers/${manufacturerSlug(row.name)}`}
                    className="!text-neutral-800 font-bold !no-underline hover:!text-bv-blue-400"
                  >
                    {row.name}
                  </BVLink>
                  <Badge tone="yellow">{row.count}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-detail text-neutral-500">
              None — {name}'s BOD entries were retained on the spec line in every
              instance.
            </p>
          )}
        </Card>
        <Card>
          <SectionTitle title={`Won the substitution from`} />
          <p className="mb-3 text-detail text-neutral-500">
            Times {name} was specified despite a different BOD.
          </p>
          {m.bodWonFrom.length > 0 ? (
            <ul className="space-y-2">
              {m.bodWonFrom.slice(0, 8).map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between rounded-md bg-bv-green-100 px-3 py-2 text-detail"
                >
                  <BVLink
                    href={`/manufacturers/${manufacturerSlug(row.name)}`}
                    className="!text-neutral-800 font-bold !no-underline hover:!text-bv-blue-400"
                  >
                    {row.name}
                  </BVLink>
                  <Badge tone="green">{row.count}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-detail text-neutral-500">
              No substitution wins recorded.
            </p>
          )}
        </Card>
      </section>

      {/* Project coverage table */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Project coverage" />
          <p className="mb-3 text-detail text-neutral-500">
            Projects where {name} appears (sorted by their footprint).
          </p>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="min-w-full text-detail">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 py-2 text-left text-micro font-bold uppercase tracking-wide text-neutral-500">
                    Project
                  </th>
                  <th className="px-3 py-2 text-right text-micro font-bold uppercase tracking-wide text-neutral-500">
                    Spec
                  </th>
                  <th className="px-3 py-2 text-right text-micro font-bold uppercase tracking-wide text-neutral-500">
                    BOD
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...projStats.entries()]
                  .sort(
                    (a, b) =>
                      b[1].specCount + b[1].bodCount - (a[1].specCount + a[1].bodCount)
                  )
                  .map(([projectId, s]) => {
                    const proj = projById.get(projectId);
                    return (
                      <tr
                        key={projectId}
                        className="border-t border-neutral-100"
                      >
                        <td className="px-3 py-2">
                          <BVLink
                            href={`/projects/${projectId}`}
                            className="!text-neutral-800 hover:!text-bv-blue-400 !no-underline"
                          >
                            {proj?.name || projectId}
                          </BVLink>
                        </td>
                        <td className="px-3 py-2 text-right font-bold">
                          {s.specCount}
                        </td>
                        <td className="px-3 py-2 text-right">{s.bodCount}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Whitespace — projects with zero presence" />
          <p className="mb-3 text-detail text-neutral-500">
            Projects in this corpus where {name} has neither a specified item
            nor a BOD entry. Sorted by total project size.
          </p>
          {whitespaceProjects.length > 0 ? (
            <ul className="space-y-2">
              {whitespaceProjects.slice(0, 12).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-detail"
                >
                  <BVLink
                    href={`/projects/${p.id}`}
                    className="!text-neutral-800 font-bold !no-underline hover:!text-bv-blue-400"
                  >
                    {p.name}
                  </BVLink>
                  <span className="text-neutral-500">
                    {p.equipmentCount} items
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-detail text-neutral-500">
              {name} appears in every project.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
