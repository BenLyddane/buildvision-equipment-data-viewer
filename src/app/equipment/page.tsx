import { equipment, projects } from "@/data/load";
import { PageTitle } from "@/components/ui";
import { EquipmentExplorer } from "./equipment-explorer";

export const metadata = {
  title: "Equipment · BuildVision Data Viewer",
};

export default function EquipmentPage() {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const rows = equipment.map((e) => ({
    ...e,
    projectName: projectMap[e.projectId] || e.projectId,
  }));
  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Equipment Explorer"
        title="Search & filter every tagged item"
        description={`${equipment.length.toLocaleString()} equipment items extracted across ${projects.length} projects. Filter by manufacturer, component type, or project.`}
      />
      <EquipmentExplorer rows={rows} />
    </div>
  );
}
