import { specTypesGlobal, specTypeSlug } from "@/data/spec-types";
import { aggregates } from "@/data/load";
import { Card, PageTitle, SectionTitle, StatCard, BVLink } from "@/components/ui";
import { CategoryTreemap, HBarChart } from "@/components/charts";
import { SpecTypesExplorer } from "./explorer";

export const metadata = {
  title: "Spec Types · BuildVision Data Viewer",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function SpecTypesPage() {
  const totalSpecs = aggregates.totals.flattenedSpecs;
  const distinct = specTypesGlobal.length;
  const numericTypes = specTypesGlobal.filter((s) => s.numeric != null);
  const enumLikeTypes = specTypesGlobal.filter(
    (s) =>
      s.numeric == null &&
      s.sampleValues.length > 0 &&
      s.sampleValues.length <= 6
  );

  // Top 25 by count
  const top = specTypesGlobal.slice(0, 25);
  // Treemap of top 30
  const treemap = specTypesGlobal
    .slice(0, 30)
    .map((s) => ({ name: s.type, value: s.count }));

  // Most common units across the dataset
  const unitMap = new Map<string, number>();
  for (const s of specTypesGlobal) {
    for (const u of s.topUnits) {
      unitMap.set(u.name, (unitMap.get(u.name) || 0) + u.count);
    }
  }
  const topUnits = [...unitMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => ({ key, count }));

  // Coverage: % of equipment that has each top spec type (proxy: distinctEquipment / totalEquipment)
  const totalEquipment = aggregates.totals.equipment;
  const coverage = specTypesGlobal.slice(0, 12).map((s) => ({
    type: s.type,
    distinctEquipment: s.distinctEquipment,
    coverage: Math.round((s.distinctEquipment / totalEquipment) * 100),
    count: s.count,
  }));

  return (
    <div className="space-y-12">
      <PageTitle
        eyebrow="Spec Types"
        title="The vocabulary of specifications"
        description="Every equipment item carries a list of typed specifications (e.g. CFM, MBH, Voltage, Manufacturer). This page indexes the entire spec-type vocabulary across the dataset so you can see what gets specified, how often, in what units, and with what value distributions."
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total spec rows"
          value={fmt(totalSpecs)}
          hint="Across all equipment"
          accent="blue"
        />
        <StatCard
          label="Distinct spec types"
          value={fmt(distinct)}
          hint="Unique field names"
          accent="purple"
        />
        <StatCard
          label="Numeric types"
          value={fmt(numericTypes.length)}
          hint="≥1 numeric value"
          accent="green"
        />
        <StatCard
          label="Enum-like types"
          value={fmt(enumLikeTypes.length)}
          hint="≤6 distinct values"
          accent="yellow"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Top spec types by frequency" />
          <p className="mb-4 text-detail text-neutral-500">
            How often each spec type appears across the corpus.
          </p>
          <HBarChart
            data={top.slice(0, 12).map((s) => ({ key: s.type, count: s.count }))}
            height={420}
          />
        </Card>
        <Card>
          <SectionTitle title="Top units" />
          <p className="mb-4 text-detail text-neutral-500">
            Most-used measurement units across all numeric specs.
          </p>
          <HBarChart data={topUnits} height={360} color="#16DA7C" />
        </Card>
      </section>

      <section>
        <SectionTitle title="Spec-type vocabulary map" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Block size = how often that spec type is specified. The 30 most
          common spec types account for a large share of the dataset.
        </p>
        <Card>
          <CategoryTreemap data={treemap} height={420} />
        </Card>
      </section>

      <section>
        <SectionTitle title="Coverage of top spec types" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          Of the {fmt(totalEquipment)} pieces of equipment in the dataset, how
          many carry each of these spec types at least once.
        </p>
        <Card>
          <ul className="space-y-3">
            {coverage.map((c) => (
              <li key={c.type}>
                <div className="mb-1 flex items-center justify-between text-detail">
                  <BVLink
                    href={`/spec-types/${specTypeSlug(c.type)}`}
                    className="!text-neutral-800 font-bold !no-underline hover:!text-bv-blue-400"
                  >
                    {c.type}
                  </BVLink>
                  <span className="text-neutral-700">
                    {fmt(c.distinctEquipment)} of {fmt(totalEquipment)}{" "}
                    <span className="font-bold">({c.coverage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-bv-blue-400"
                    style={{ width: `${c.coverage}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionTitle title="Browse all spec types" />
        <p className="mb-4 max-w-3xl text-detail text-neutral-500">
          {fmt(distinct)} distinct spec types across the dataset. Click any
          row to see value distributions, units, and which categories use it.
        </p>
        <SpecTypesExplorer
          rows={specTypesGlobal.map((s) => ({
            type: s.type,
            count: s.count,
            distinctEquipment: s.distinctEquipment,
            isNumeric: s.numeric != null,
            topUnit: s.topUnits[0]?.name || null,
            min: s.numeric?.min ?? null,
            max: s.numeric?.max ?? null,
            avg: s.numeric?.avg ?? null,
            sampleCount: s.sampleValues.length,
            sampleValue: s.sampleValues[0]?.value || null,
          }))}
        />
      </section>
    </div>
  );
}
