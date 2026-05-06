import { notFound } from "next/navigation";
import Link from "next/link";
import {
  specTypeFromSlug,
  specTypeSlug,
  specTypesGlobal,
  specTypesByCanonical,
} from "@/data/spec-types";
import {
  Badge,
  BVLink,
  Card,
  PageTitle,
  SectionTitle,
  StatCard,
} from "@/components/ui";
import { HBarChart } from "@/components/charts";
import { ValueHistogram } from "./histogram";

export const dynamicParams = false;

export function generateStaticParams() {
  // Pre-render the top 250 spec types (covers ~95%+ of usage).
  return specTypesGlobal.slice(0, 250).map((s) => ({
    slug: specTypeSlug(s.type),
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const s = specTypeFromSlug(params.slug);
  return { title: `${s?.type || "Spec type"} · BuildVision Data Viewer` };
}

function fmt(n: number | null | undefined, digits = 1) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function SpecTypeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const s = specTypeFromSlug(params.slug);
  if (!s) notFound();

  // Pull all per-canonical-category breakdowns for this spec type
  const perCanon = specTypesByCanonical
    .filter((x) => x.type === s.type && x.canonicalType !== "*")
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-10">
      <PageTitle
        eyebrow={
          <span>
            <Link
              href="/spec-types"
              className="text-bv-blue-400 hover:underline"
            >
              Spec Types
            </Link>{" "}
            · <span className="text-neutral-500">detail</span>
          </span>
        }
        title={s.type}
        description={`Appears ${s.count.toLocaleString()} times across ${s.distinctEquipment.toLocaleString()} pieces of equipment in ${perCanon.length || 1} canonical categor${
          perCanon.length === 1 ? "y" : "ies"
        }.`}
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Spec rows"
          value={s.count.toLocaleString()}
          accent="blue"
        />
        <StatCard
          label="Equipment using it"
          value={s.distinctEquipment.toLocaleString()}
          accent="purple"
        />
        <StatCard
          label="Numeric values"
          value={s.numeric ? s.numeric.count.toLocaleString() : "—"}
          accent="green"
        />
        <StatCard
          label="Top unit"
          value={s.topUnits[0]?.name || "—"}
          hint={
            s.topUnits[0]
              ? `${s.topUnits[0].count.toLocaleString()} rows`
              : undefined
          }
          accent="yellow"
        />
      </section>

      {s.numeric && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <SectionTitle title="Numeric distribution" />
            <p className="mb-3 text-detail text-neutral-500">
              Range: <span className="font-bold">{fmt(s.numeric.min)}</span> –{" "}
              <span className="font-bold">{fmt(s.numeric.max)}</span> · Avg{" "}
              <span className="font-bold">{fmt(s.numeric.avg, 2)}</span>
            </p>
            <p className="text-detail text-neutral-500">
              Built from {s.numeric.count.toLocaleString()} numeric values out
              of {s.count.toLocaleString()} total rows.
            </p>
          </Card>
          <Card className="lg:col-span-2">
            <SectionTitle title="Histogram" />
            <ValueHistogram
              specType={s.type}
              min={s.numeric.min!}
              max={s.numeric.max!}
            />
          </Card>
        </section>
      )}

      {!s.numeric && s.sampleValues.length > 0 && (
        <section>
          <SectionTitle title="Top values" />
          <p className="mb-4 text-detail text-neutral-500">
            Most common values for this spec type — useful for identifying
            enums (e.g. drive type: DIRECT vs BELT) and naming conventions.
          </p>
          <Card>
            <HBarChart
              data={s.sampleValues.map((v) => ({
                key: v.value.length > 32 ? v.value.slice(0, 30) + "…" : v.value,
                count: v.count,
              }))}
              height={Math.max(200, s.sampleValues.length * 32)}
            />
          </Card>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Top units" />
          {s.topUnits.length > 0 ? (
            <ul className="space-y-2">
              {s.topUnits.map((u) => (
                <li
                  key={u.name}
                  className="flex items-center justify-between text-detail"
                >
                  <span className="font-mono font-bold text-neutral-800">
                    {u.name}
                  </span>
                  <Badge tone="neutral">{u.count.toLocaleString()}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-detail text-neutral-500">
              No unit recorded for this spec type.
            </p>
          )}
        </Card>
        <Card>
          <SectionTitle title="Sub-categories" />
          <p className="mb-3 text-detail text-neutral-500">
            The category headings under which this spec is grouped (e.g.
            "Summer Recovery", "Wheel Design").
          </p>
          {s.topCategories.length > 0 ? (
            <ul className="space-y-2">
              {s.topCategories.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between text-detail"
                >
                  <span className="font-bold text-neutral-800">{c.name}</span>
                  <Badge tone="neutral">{c.count.toLocaleString()}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-detail text-neutral-500">
              This spec type appears at the top level of equipment specs (no
              sub-category).
            </p>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle title="Where this spec appears" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Canonical categories that include this spec type, with the per-
          category numeric range when available.
        </p>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-detail">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="border-b border-neutral-200 px-4 py-3 text-left text-micro font-bold uppercase tracking-wide">
                  Canonical category
                </th>
                <th className="border-b border-neutral-200 px-4 py-3 text-right text-micro font-bold uppercase tracking-wide">
                  Rows
                </th>
                <th className="border-b border-neutral-200 px-4 py-3 text-right text-micro font-bold uppercase tracking-wide">
                  Equipment
                </th>
                <th className="border-b border-neutral-200 px-4 py-3 text-right text-micro font-bold uppercase tracking-wide">
                  Range / sample
                </th>
                <th className="border-b border-neutral-200 px-4 py-3 text-right text-micro font-bold uppercase tracking-wide">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {perCanon.map((p) => (
                <tr
                  key={p.canonicalType}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-2.5 font-bold text-neutral-800">
                    {p.canonicalType}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {p.count.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {p.distinctEquipment.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-700">
                    {p.numeric
                      ? `${fmt(p.numeric.min)} – ${fmt(p.numeric.max)}`
                      : p.sampleValues[0]?.value || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-700">
                    {p.numeric ? fmt(p.numeric.avg, 2) : "—"}
                  </td>
                </tr>
              ))}
              {perCanon.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-neutral-500"
                  >
                    No category breakdown available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
