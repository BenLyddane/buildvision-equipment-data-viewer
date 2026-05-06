import { equipment } from "@/data/load";
import { Card, PageTitle } from "@/components/ui";
import { ManufacturersExplorer } from "./manufacturers-explorer";

export const metadata = {
  title: "Manufacturers · BuildVision Data Viewer",
};

type Row = {
  name: string;
  count: number;
  projectCount: number;
  componentTypeCount: number;
  topComponentTypes: Array<{ name: string; count: number }>;
  asBodCount: number;
};

export default function ManufacturersPage() {
  const map = new Map<
    string,
    {
      count: number;
      projects: Set<string>;
      types: Map<string, number>;
      asBod: number;
    }
  >();
  // BOD counts (as basis-of-design only)
  for (const e of equipment) {
    if (e.bodManufacturer) {
      const r =
        map.get(e.bodManufacturer) ||
        ({
          count: 0,
          projects: new Set<string>(),
          types: new Map<string, number>(),
          asBod: 0,
        } as any);
      r.asBod = (r.asBod || 0) + 1;
      map.set(e.bodManufacturer, r);
    }
  }
  for (const e of equipment) {
    if (!e.manufacturer) continue;
    const r =
      map.get(e.manufacturer) ||
      ({
        count: 0,
        projects: new Set<string>(),
        types: new Map<string, number>(),
        asBod: 0,
      } as any);
    r.count++;
    r.projects.add(e.projectId);
    if (e.componentTypeName) {
      r.types.set(
        e.componentTypeName,
        (r.types.get(e.componentTypeName) || 0) + 1
      );
    }
    map.set(e.manufacturer, r);
  }

  const rows: Row[] = [...map.entries()].map(([name, v]) => ({
    name,
    count: v.count,
    projectCount: v.projects.size,
    componentTypeCount: v.types.size,
    asBodCount: v.asBod,
    topComponentTypes: [...v.types.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n, c]) => ({ name: n, count: c })),
  }));

  rows.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Manufacturers"
        title="Manufacturer leaderboard"
        description={`${rows.length.toLocaleString()} unique manufacturers appear across the dataset. See how often each is specified, how many projects they appear in, and what categories they cover.`}
      />
      <ManufacturersExplorer rows={rows} />
    </div>
  );
}
