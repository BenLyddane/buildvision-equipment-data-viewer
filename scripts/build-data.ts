/**
 * Build-time data transform.
 * Reads the 3 top-level CSVs from /data and emits normalized JSON
 * to /src/data/generated for fast static import in Next.js pages.
 */
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const OUT_DIR = path.join(ROOT, "src", "data", "generated");

type RawProject = {
  project_id: string;
  project_name: string;
  created_at: string;
  due_date: string;
  next_bid_due_date: string;
  notes: string;
};

type RawEquipment = {
  project_id: string;
  package_id: string;
  package: string;
  equipment_id: string;
  equipment_tag: string;
  component_type_id: string;
  component_type_name: string;
  quantity: string;
  component_id: string;
  component_name: string;
  component_model: string;
  component_manufacturer_name: string;
  bod_manufacturer_name: string;
};

type RawRequirement = {
  project_id: string;
  package_id: string;
  spec_id: string;
  equipment_id: string;
  type_id: string;
  type_name: string;
  option_id: string;
  option_name: string;
  unit_id: string;
  unit_name: string;
  raw_specs: string;
  literal_value: string;
  literal_unit: string;
  literal_category: string;
  literal_type: string;
};

function readCsv<T>(file: string): T[] {
  const text = fs.readFileSync(file, "utf8");
  const parsed = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (parsed.errors?.length) {
    // Log but don't fail the build for stray quote issues.
    console.warn(
      `[build-data] ${path.basename(file)} parsed with ${parsed.errors.length} warnings (first: ${parsed.errors[0]?.message})`
    );
  }
  return (parsed.data || []).filter(Boolean);
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function bumpCount<K>(map: Map<K, number>, key: K, by = 1) {
  map.set(key, (map.get(key) || 0) + by);
}

function topN<K>(map: Map<K, number>, n: number) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

function main() {
  console.log("[build-data] reading CSVs from", DATA_DIR);
  const projects = readCsv<RawProject>(path.join(DATA_DIR, "Project.csv"));
  const equipment = readCsv<RawEquipment>(path.join(DATA_DIR, "Equipment.csv"));
  const requirements = readCsv<RawRequirement>(
    path.join(DATA_DIR, "Requirements.csv")
  );
  console.log(
    `[build-data] projects=${projects.length} equipment=${equipment.length} requirements=${requirements.length}`
  );

  // ---- Projects ----
  const projectsOut = projects.map((p) => ({
    id: p.project_id,
    name: p.project_name,
    createdAt: p.created_at || null,
    dueDate: p.due_date || null,
    nextBidDueDate: p.next_bid_due_date || null,
    notes: p.notes || null,
  }));

  // ---- Equipment (normalized) ----
  const equipmentOut = equipment.map((e) => ({
    id: e.equipment_id,
    projectId: e.project_id,
    packageId: e.package_id || null,
    packageName: e.package || null,
    tag: e.equipment_tag || null,
    componentTypeId: e.component_type_id || null,
    componentTypeName: e.component_type_name || null,
    quantity: Number(e.quantity || 0) || 0,
    componentId: e.component_id || null,
    componentName: e.component_name || null,
    componentModel: e.component_model || null,
    manufacturer: e.component_manufacturer_name || null,
    bodManufacturer: e.bod_manufacturer_name || null,
  }));

  // ---- Requirements grouped by equipment ----
  const requirementsByEquipment: Record<
    string,
    Array<{
      specId: string;
      type: string | null;
      value: string | null;
      unit: string | null;
      category: string | null;
      optionName: string | null;
    }>
  > = {};
  for (const r of requirements) {
    if (!r.equipment_id) continue;
    const arr =
      requirementsByEquipment[r.equipment_id] ||
      (requirementsByEquipment[r.equipment_id] = []);
    arr.push({
      specId: r.spec_id,
      type: r.literal_type || r.type_name || null,
      value: r.literal_value || null,
      unit: r.literal_unit || r.unit_name || null,
      category: r.literal_category || null,
      optionName: r.option_name || null,
    });
  }

  // ---- Aggregates ----
  const manufacturerCounts = new Map<string, number>();
  const bodManufacturerCounts = new Map<string, number>();
  const componentTypeCounts = new Map<string, number>();
  const equipmentByProject = new Map<string, number>();
  const manufacturersByProject = new Map<string, Set<string>>();
  const packagesByProject = new Map<string, Set<string>>();
  const componentTypesByProject = new Map<string, Set<string>>();
  // manufacturer x componentType
  const manuByType = new Map<string, Map<string, number>>();
  // BOD vs actual mismatches
  let bodMatches = 0;
  let bodMismatches = 0;
  let bodMissing = 0;
  const bodMismatchExamples: Array<{
    equipmentId: string;
    projectId: string;
    componentType: string | null;
    bod: string;
    actual: string;
  }> = [];

  for (const e of equipmentOut) {
    if (e.manufacturer) bumpCount(manufacturerCounts, e.manufacturer);
    if (e.bodManufacturer) bumpCount(bodManufacturerCounts, e.bodManufacturer);
    if (e.componentTypeName) bumpCount(componentTypeCounts, e.componentTypeName);
    bumpCount(equipmentByProject, e.projectId);
    if (e.manufacturer) {
      const set =
        manufacturersByProject.get(e.projectId) || new Set<string>();
      set.add(e.manufacturer);
      manufacturersByProject.set(e.projectId, set);
    }
    if (e.packageName) {
      const set = packagesByProject.get(e.projectId) || new Set<string>();
      set.add(e.packageName);
      packagesByProject.set(e.projectId, set);
    }
    if (e.componentTypeName) {
      const set =
        componentTypesByProject.get(e.projectId) || new Set<string>();
      set.add(e.componentTypeName);
      componentTypesByProject.set(e.projectId, set);
    }
    if (e.componentTypeName && e.manufacturer) {
      const inner =
        manuByType.get(e.componentTypeName) || new Map<string, number>();
      bumpCount(inner, e.manufacturer);
      manuByType.set(e.componentTypeName, inner);
    }
    if (e.bodManufacturer && e.manufacturer) {
      const norm = (s: string) => s.trim().toLowerCase();
      if (norm(e.bodManufacturer) === norm(e.manufacturer)) {
        bodMatches++;
      } else {
        bodMismatches++;
        if (bodMismatchExamples.length < 50) {
          bodMismatchExamples.push({
            equipmentId: e.id,
            projectId: e.projectId,
            componentType: e.componentTypeName,
            bod: e.bodManufacturer,
            actual: e.manufacturer,
          });
        }
      }
    } else if (e.bodManufacturer || e.manufacturer) {
      bodMissing++;
    }
  }

  const projectSummaries = projectsOut.map((p) => ({
    ...p,
    equipmentCount: equipmentByProject.get(p.id) || 0,
    manufacturerCount: manufacturersByProject.get(p.id)?.size || 0,
    packageCount: packagesByProject.get(p.id)?.size || 0,
    componentTypeCount: componentTypesByProject.get(p.id)?.size || 0,
  }));

  // Manufacturer market share by component type (top 10 types, top 8 manufacturers each)
  const topTypes = topN(componentTypeCounts, 12).map((x) => x.key);
  const marketShare = topTypes.map((type) => {
    const inner = manuByType.get(type) || new Map();
    const top = topN(inner, 8);
    const total = [...inner.values()].reduce((a, b) => a + b, 0);
    return { type, total, top };
  });

  const aggregates = {
    totals: {
      projects: projectsOut.length,
      equipment: equipmentOut.length,
      requirements: requirements.length,
      uniqueManufacturers: manufacturerCounts.size,
      uniqueComponentTypes: componentTypeCounts.size,
    },
    topManufacturers: topN(manufacturerCounts, 15),
    topBodManufacturers: topN(bodManufacturerCounts, 15),
    topComponentTypes: topN(componentTypeCounts, 15),
    equipmentByProject: [...equipmentByProject.entries()]
      .map(([projectId, count]) => ({ projectId, count }))
      .sort((a, b) => b.count - a.count),
    bod: {
      matches: bodMatches,
      mismatches: bodMismatches,
      missing: bodMissing,
      examples: bodMismatchExamples,
    },
    marketShare,
  };

  // ---- LLM-friendly dataset summary (compact, ~tens of KB) ----
  // Per-project rollups
  const perProjectSummary = projectSummaries.map((p) => {
    const projEq = equipmentOut.filter((e) => e.projectId === p.id);
    const typeCounts = new Map<string, number>();
    const manuCounts = new Map<string, number>();
    for (const e of projEq) {
      if (e.componentTypeName)
        bumpCount(typeCounts, e.componentTypeName);
      if (e.manufacturer) bumpCount(manuCounts, e.manufacturer);
    }
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      equipmentCount: p.equipmentCount,
      packageCount: p.packageCount,
      manufacturerCount: p.manufacturerCount,
      componentTypeCount: p.componentTypeCount,
      componentTypes: [...typeCounts.entries()].map(([k, v]) => ({
        name: k,
        count: v,
      })),
      manufacturers: [...manuCounts.entries()].map(([k, v]) => ({
        name: k,
        count: v,
      })),
    };
  });

  // Per-component-type rollup (with top manufacturers)
  const perTypeSummary = [...componentTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => {
      const inner = manuByType.get(type) || new Map<string, number>();
      return {
        name: type,
        count,
        manufacturers: [...inner.entries()].map(([k, v]) => ({
          name: k,
          count: v,
        })),
      };
    });

  // Per-manufacturer rollup
  const manuRollup = new Map<
    string,
    { count: number; types: Map<string, number>; projects: Set<string> }
  >();
  for (const e of equipmentOut) {
    if (!e.manufacturer) continue;
    const r =
      manuRollup.get(e.manufacturer) ||
      ({
        count: 0,
        types: new Map<string, number>(),
        projects: new Set<string>(),
      } as any);
    r.count++;
    r.projects.add(e.projectId);
    if (e.componentTypeName)
      r.types.set(
        e.componentTypeName,
        (r.types.get(e.componentTypeName) || 0) + 1
      );
    manuRollup.set(e.manufacturer, r);
  }
  const perManufacturerSummary = [...manuRollup.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, v]) => ({
      name,
      count: v.count,
      projectCount: v.projects.size,
      componentTypes: [...v.types.entries()].map(([k, c]) => ({
        name: k,
        count: c,
      })),
    }));

  const datasetSummary = {
    description:
      "Summary of HVAC/MEP equipment-schedule data extracted from construction bid packages.",
    schema: {
      project: ["id", "name", "createdAt", "equipmentCount", "packageCount"],
      componentType: ["name", "count", "manufacturers[]"],
      manufacturer: ["name", "count", "projectCount", "componentTypes[]"],
    },
    totals: aggregates.totals,
    bod: {
      matches: aggregates.bod.matches,
      mismatches: aggregates.bod.mismatches,
      missing: aggregates.bod.missing,
    },
    projects: perProjectSummary,
    componentTypes: perTypeSummary,
    manufacturers: perManufacturerSummary,
  };

  // ---- Write ----
  ensureDir(OUT_DIR);
  fs.writeFileSync(
    path.join(OUT_DIR, "projects.json"),
    JSON.stringify(projectSummaries)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "equipment.json"),
    JSON.stringify(equipmentOut)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "requirements-by-equipment.json"),
    JSON.stringify(requirementsByEquipment)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "aggregates.json"),
    JSON.stringify(aggregates)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "dataset-summary.json"),
    JSON.stringify(datasetSummary)
  );

  console.log(`[build-data] wrote outputs to ${OUT_DIR}`);
}

main();
