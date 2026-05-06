import projectsJson from "./generated/projects.json";
import equipmentJson from "./generated/equipment.json";
import aggregatesJson from "./generated/aggregates.json";
import requirementsJson from "./generated/requirements-by-equipment.json";
import type {
  Aggregates,
  Equipment,
  ProjectSummary,
  Requirement,
} from "./types";

export const projects = projectsJson as ProjectSummary[];
export const equipment = equipmentJson as Equipment[];
export const aggregates = aggregatesJson as Aggregates;
export const requirementsByEquipment = requirementsJson as Record<
  string,
  Requirement[]
>;

export function getProject(id: string): ProjectSummary | undefined {
  return projects.find((p) => p.id === id);
}

export function getProjectEquipment(projectId: string): Equipment[] {
  return equipment.filter((e) => e.projectId === projectId);
}

export function getEquipment(id: string): Equipment | undefined {
  return equipment.find((e) => e.id === id);
}

export function getRequirements(equipmentId: string): Requirement[] {
  return requirementsByEquipment[equipmentId] || [];
}
