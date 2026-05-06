import { equipment } from "@/data/load";
import { PageTitle } from "@/components/ui";
import { ComponentTypesExplorer } from "./component-types-explorer";

export const metadata = {
  title: "Component Types · BuildVision Data Viewer",
};

type Row = {
  name: string;
  count: number;
  manufacturerCount: number;
  projectCount: number;
  topManufacturers: Array<{ name: string; count: number }>;
};

export default function ComponentTypesPage() {
  const map = new Map<
    string,
    {
      count: number;
      projects: Set<string>;
      manufacturers: Map<string, number>;
    }
  >();
  for (const e of equipment) {
    if (!e.componentTypeName) continue;
    const r =
      map.get(e.componentTypeName) ||
      ({
        count: 0,
        projects: new Set<string>(),
        manufacturers: new Map<string, number>(),
      } as any);
    r.count++;
    r.projects.add(e.projectId);
    if (e.manufacturer) {
      r.manufacturers.set(
        e.manufacturer,
        (r.manufacturers.get(e.manufacturer) || 0) + 1
      );
    }
    map.set(e.componentTypeName, r);
  }
  const rows: Row[] = [...map.entries()].map(([name, v]) => ({
    name,
    count: v.count,
    projectCount: v.projects.size,
    manufacturerCount: v.manufacturers.size,
    topManufacturers: [...v.manufacturers.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([n, c]) => ({ name: n, count: c })),
  }));
  rows.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Component Types"
        title="Equipment categories"
        description={`${rows.length.toLocaleString()} unique component types catalogued. See category frequency and the manufacturers that dominate each.`}
      />
      <ComponentTypesExplorer rows={rows} />
    </div>
  );
}
