import Link from "next/link";
import { projects } from "@/data/load";
import { PageTitle } from "@/components/ui";
import { ProjectsTable } from "./projects-table";

export const metadata = {
  title: "Projects · BuildVision Data Viewer",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Projects"
        title="All bid packages"
        description={`Browse ${projects.length} projects extracted from construction bid documents. Click any row for the full equipment breakdown.`}
      />
      <ProjectsTable
        projects={projects.map((p) => ({
          ...p,
          createdAtMs: p.createdAt ? new Date(p.createdAt).getTime() : 0,
        }))}
      />
    </div>
  );
}
