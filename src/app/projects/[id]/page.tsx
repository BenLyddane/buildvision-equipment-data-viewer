import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getProject,
  getProjectEquipment,
  projects,
  requirementsByEquipment,
} from "@/data/load";
import { Card, PageTitle, StatCard } from "@/components/ui";
import { ProjectEquipmentTable } from "./equipment-table";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const project = getProject(params.id);
  return {
    title: `${project?.name || "Project"} · BuildVision Data Viewer`,
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = getProject(params.id);
  if (!project) return notFound();

  const equipment = getProjectEquipment(project.id);

  // Group by package
  const byPackage = new Map<string, number>();
  for (const e of equipment) {
    const k = e.packageName || "Uncategorized";
    byPackage.set(k, (byPackage.get(k) || 0) + 1);
  }
  const packages = [...byPackage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Manufacturer breakdown for this project
  const manuMap = new Map<string, number>();
  for (const e of equipment) {
    if (e.manufacturer)
      manuMap.set(e.manufacturer, (manuMap.get(e.manufacturer) || 0) + 1);
  }
  const topManu = [...manuMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Total spec rows for this project
  const specCount = equipment.reduce(
    (sum, e) => sum + (requirementsByEquipment[e.id]?.length || 0),
    0
  );

  // Pre-attach reqs count to rows
  const rows = equipment.map((e) => ({
    ...e,
    specCount: requirementsByEquipment[e.id]?.length || 0,
  }));

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-1 text-detail text-neutral-500 hover:text-bv-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All projects
        </Link>
        <PageTitle
          eyebrow="Project"
          title={project.name || "Untitled project"}
          description={
            project.createdAt
              ? `Created ${new Date(project.createdAt).toLocaleDateString()}`
              : undefined
          }
        />
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Equipment" value={project.equipmentCount} accent="blue" />
        <StatCard label="Packages" value={project.packageCount} accent="purple" />
        <StatCard
          label="Manufacturers"
          value={project.manufacturerCount}
          accent="yellow"
        />
        <StatCard label="Spec rows" value={specCount} accent="green" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-h5 font-bold text-neutral-900">
            Schedule packages
          </h2>
          <p className="mt-1 mb-4 text-detail text-neutral-500">
            Equipment schedules extracted for this project.
          </p>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {packages.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
              >
                <span className="truncate text-detail text-neutral-700">
                  {p.name}
                </span>
                <span className="ml-3 inline-flex items-center rounded-full bg-bv-blue-100 px-2 py-0.5 text-micro font-bold text-bv-blue-400">
                  {p.count}
                </span>
              </li>
            ))}
            {packages.length === 0 && (
              <li className="text-detail text-neutral-500">
                No packages found.
              </li>
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="text-h5 font-bold text-neutral-900">
            Top manufacturers
          </h2>
          <p className="mt-1 mb-4 text-detail text-neutral-500">
            Most-specified brands in this project.
          </p>
          <ul className="space-y-2">
            {topManu.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between text-detail"
              >
                <span className="text-neutral-700">{name}</span>
                <span className="font-bold text-neutral-800">{count}</span>
              </li>
            ))}
            {topManu.length === 0 && (
              <li className="text-detail text-neutral-500">
                No manufacturer data.
              </li>
            )}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-h5 font-bold text-neutral-900">
          Equipment ({equipment.length.toLocaleString()})
        </h2>
        <ProjectEquipmentTable rows={rows} />
      </section>
    </div>
  );
}
