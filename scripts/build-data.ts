/**
 * Build-time data transform.
 * Reads the 3 top-level CSVs from /data and emits normalized JSON
 * to /src/data/generated for fast static import in Next.js pages.
 *
 * Notes on data quality:
 * - Requirements.csv has a `raw_specs` JSON column that contains the rich
 *   structured spec data (type/value/unit/category, plus nested kinds for
 *   things like Energy Recovery Wheel performance). The flat `literal_*`
 *   columns are mostly empty, so we always prefer raw_specs and fall back.
 * - Manufacturers are normalized (case + common suffixes) so we can do
 *   exact joins instead of contains() searches.
 * - We extract a `numeric` value when the value parses to a number; this
 *   lets us do range queries / averages downstream.
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
    console.warn(
      `[build-data] ${path.basename(file)} parsed with ${parsed.errors.length} warnings (first: ${parsed.errors[0]?.message})`
    );
  }
  return (parsed.data || []).filter(Boolean);
}

/**
 * The Requirements.csv has a column `raw_specs` that contains a JSON blob
 * whose internal double-quotes are NOT properly escaped (no `""` doubling
 * and no enclosing CSV quoting either — except for the outer wrapping
 * quotes around the whole JSON). Papaparse mangles it.
 *
 * Approach:
 *   1. Read line-by-line (rows are single-line in this file).
 *   2. The first 10 columns are simple no-comma values (UUIDs / blanks),
 *      the column 11 (`raw_specs`) is a `"{...}"` JSON blob, and the last
 *      4 columns are simple values again (`literal_value`, `literal_unit`,
 *      `literal_category`, `literal_type`).
 *   3. Walk the raw line: take the first 10 comma-delimited fields, then
 *      find the `"{...}"` blob (greedy from `"{` through the matching
 *      closing `}"`), then the remaining fields are the trailing 4.
 */
function readRequirementsCsv(file: string): RawRequirement[] {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headerLine = lines[0];
  const headers = headerLine.split(",").map((s) => s.trim());
  const FIRST = 10; // column index where raw_specs starts
  const TRAILING = 4; // literal_value, literal_unit, literal_category, literal_type
  const out: RawRequirement[] = [];
  let bad = 0;

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;

    // Take the first 10 simple fields (no commas/quotes inside any of them).
    const parts: string[] = [];
    let cursor = 0;
    for (let i = 0; i < FIRST; i++) {
      const next = line.indexOf(",", cursor);
      if (next < 0) {
        parts.push(line.slice(cursor));
        cursor = line.length;
        break;
      }
      parts.push(line.slice(cursor, next));
      cursor = next + 1;
    }
    if (parts.length < FIRST) {
      // Probably a blank/garbage line; skip.
      bad++;
      continue;
    }

    // Now find the raw_specs blob.
    let raw_specs = "";
    let after = cursor;
    if (line[cursor] === '"' && line[cursor + 1] === "{") {
      // Walk character-by-character to find the matching closing `}` followed
      // by `"`. We'll track JSON object/array depth and ignore strings.
      let i = cursor + 1; // skip opening quote
      let depth = 0;
      let inStr = false;
      let escaped = false;
      let endIdx = -1;
      for (; i < line.length; i++) {
        const ch = line[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (inStr) {
          if (ch === "\\") {
            escaped = true;
          } else if (ch === '"') {
            // Inside a JSON string, a closing quote ends it — UNLESS this
            // looks like the CSV-wrapping quote (i.e. depth==0 already).
            // We can't fully disambiguate, but JSON keys/values always
            // appear at depth>=1 inside the braces, so this is safe here.
            inStr = false;
          }
        } else {
          if (ch === '"') {
            inStr = true;
          } else if (ch === "{" || ch === "[") {
            depth++;
          } else if (ch === "}" || ch === "]") {
            depth--;
            if (depth === 0) {
              // Expect closing CSV quote next
              if (line[i + 1] === '"') {
                endIdx = i + 1;
              } else {
                endIdx = i;
              }
              break;
            }
          }
        }
      }
      if (endIdx < 0) {
        bad++;
        continue;
      }
      raw_specs = line.slice(cursor + 1, endIdx); // strip outer quotes
      after = endIdx + 1; // position after closing `"`
      // skip the comma
      if (line[after] === ",") after++;
    } else {
      // raw_specs blank
      const next = line.indexOf(",", cursor);
      if (next < 0) {
        // weird row; skip
        bad++;
        continue;
      }
      raw_specs = line.slice(cursor, next);
      after = next + 1;
    }

    // Trailing 4 fields, simple split. Last field has no trailing comma.
    const trailing = line.slice(after);
    const trail: string[] = [];
    {
      let c2 = 0;
      for (let i = 0; i < TRAILING - 1; i++) {
        const next = trailing.indexOf(",", c2);
        if (next < 0) {
          trail.push(trailing.slice(c2));
          c2 = trailing.length;
          break;
        }
        trail.push(trailing.slice(c2, next));
        c2 = next + 1;
      }
      trail.push(trailing.slice(c2));
    }
    while (trail.length < TRAILING) trail.push("");

    const obj: any = {};
    for (let i = 0; i < FIRST; i++) obj[headers[i]] = parts[i];
    obj[headers[FIRST]] = raw_specs;
    for (let i = 0; i < TRAILING; i++) obj[headers[FIRST + 1 + i]] = trail[i];
    out.push(obj as RawRequirement);
  }

  if (bad)
    console.warn(
      `[build-data] Requirements.csv: ${bad} unparseable lines skipped`
    );
  return out;
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

// ---------- Manufacturer normalization ----------

const MANU_ALIAS: Record<string, string> = {
  "greenheck fan corp": "Greenheck",
  "greenheck fan corporation": "Greenheck",
  "greenheck fan": "Greenheck",
  greenheck: "Greenheck",
  trane: "Trane",
  "the trane company": "Trane",
  carrier: "Carrier",
  "carrier corp": "Carrier",
  "carrier corporation": "Carrier",
  daikin: "Daikin",
  "daikin applied": "Daikin",
  "daikin industries": "Daikin",
  mitsubishi: "Mitsubishi Electric",
  "mitsubishi electric": "Mitsubishi Electric",
  "mitsubishi heavy industries": "Mitsubishi Heavy Industries",
  lg: "LG",
  "lg electronics": "LG",
  lennox: "Lennox",
  "lennox industries": "Lennox",
  rheem: "Rheem",
  ruud: "Rheem",
  york: "York",
  "york by johnson controls": "York",
  "johnson controls": "Johnson Controls",
  "loren cook": "Loren Cook",
  "loren cook company": "Loren Cook",
  cook: "Loren Cook",
  modine: "Modine",
  reznor: "Reznor",
  "reznor by nortek": "Reznor",
  ruskin: "Ruskin",
  twin: "Twin City Fan",
  "twin city": "Twin City Fan",
  "twin city fan": "Twin City Fan",
  "twin city fan & blower": "Twin City Fan",
  aaon: "AAON",
  bard: "Bard",
  "addison hvac": "Addison",
  addison: "Addison",
  "valent air": "Valent",
  valent: "Valent",
  airxchange: "Airxchange",
  "air-xchange": "Airxchange",
  munters: "Munters",
  "renewaire": "RenewAire",
  "innovent air": "Innovent",
  innovent: "Innovent",
  semco: "SEMCO",
  "semco hvac": "SEMCO",
  haakon: "Haakon",
  "annexair": "AnnexAir",
};

function canonicalManufacturer(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  // strip common suffixes
  s = s
    .replace(/\b(corp\.?|corporation|company|co\.?|incorporated|inc\.?|llc|l\.l\.c\.?|ltd\.?|limited|plc|gmbh|group|industries|hvac|fan corp\.?|fan)\b/gi, "")
    .replace(/[®™©]/g, "")
    .replace(/[,.\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const key = s.toLowerCase();
  if (MANU_ALIAS[key]) return MANU_ALIAS[key];
  // some entries have parenthetical suffixes "Greenheck (USA)"
  const noParen = key.replace(/\([^)]*\)/g, "").trim();
  if (MANU_ALIAS[noParen]) return MANU_ALIAS[noParen];
  // Title-case fallback
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) =>
      w.length <= 3 && w === w.toUpperCase()
        ? w
        : w[0].toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

// ---------- Component-type canonicalization ----------
//
// Many "Component Types" come from the schedule sheet name (e.g.
// "ROOFTOP UNIT SCHEDULE", "DOAS SCHEDULE", "ENERGY RECOVERY UNIT SCHEDULE").
// This maps both raw component_type_name AND raw package text into a
// canonical category for cross-project rollups.

type Canon =
  | "Packaged Rooftop Unit"
  | "Heat Pump"
  | "Dedicated Outdoor-Air Unit (DOAS)"
  | "Energy Recovery Unit"
  | "Air Handling Unit"
  | "Make-Up Air Unit"
  | "VAV Terminal Unit"
  | "Fan Coil Unit"
  | "Unit Heater"
  | "Cabinet Heater"
  | "Infrared Heater"
  | "Furnace"
  | "Boiler"
  | "Pump"
  | "Water Heater"
  | "HVAC Fan"
  | "Power Ventilator"
  | "Gravity Ventilator"
  | "HVLS Fan"
  | "Louver"
  | "Damper"
  | "Diffuser/Register/Grille"
  | "Kitchen Hood"
  | "VRF System"
  | "Split System"
  | "Computer Room AC"
  | "Snow Melt"
  | "Water Heater (Gas)"
  | "Other";

function canonicalType(componentTypeName: string | null, pkg: string | null): Canon {
  const t = `${componentTypeName || ""} ${pkg || ""}`.toLowerCase();
  if (/energy[\s-]?recovery|\beru\b|\berv\b|enthalpy/.test(t)) return "Energy Recovery Unit";
  if (/dedicated\s*outdoor|doas|outdoor air unit/.test(t)) return "Dedicated Outdoor-Air Unit (DOAS)";
  if (/heat\s*pump/.test(t)) return "Heat Pump";
  if (/packaged\s*rooftop|rooftop\s*air[-\s]?conditioning|rooftop unit|rtu schedule|roof[-\s]?top/.test(t)) return "Packaged Rooftop Unit";
  if (/air handling|ahu|blower coil/.test(t)) return "Air Handling Unit";
  if (/make[-\s]?up\s*air|mua/.test(t)) return "Make-Up Air Unit";
  if (/variable[-\s]?air[-\s]?volume|vav box|vav schedule|vav terminal/.test(t)) return "VAV Terminal Unit";
  if (/fan coil/.test(t)) return "Fan Coil Unit";
  if (/cabinet heater/.test(t)) return "Cabinet Heater";
  if (/infrared heater/.test(t)) return "Infrared Heater";
  if (/unit heater/.test(t)) return "Unit Heater";
  if (/furnace/.test(t)) return "Furnace";
  if (/boiler/.test(t)) return "Boiler";
  if (/water heater/.test(t)) return "Water Heater";
  if (/in-line.*pump|hydronic pump|pump schedule/.test(t)) return "Pump";
  if (/hvls/.test(t)) return "HVLS Fan";
  if (/power ventilator/.test(t)) return "Power Ventilator";
  if (/gravity ventilator|gravity vent/.test(t)) return "Gravity Ventilator";
  if (/(?:^|\b)hvac fan|axial fan|centrifugal fan|fan schedule|exhaust fan|destratification fan/.test(t)) return "HVAC Fan";
  if (/louver/.test(t)) return "Louver";
  if (/damper/.test(t)) return "Damper";
  if (/diffuser|register|grille|air device|air terminal/.test(t)) return "Diffuser/Register/Grille";
  if (/kitchen hood|ventilation hood/.test(t)) return "Kitchen Hood";
  if (/variable refrigerant flow|vrf/.test(t)) return "VRF System";
  if (/split system|mini split|small[-\s]?capacity split/.test(t)) return "Split System";
  if (/computer room|crac|crah/.test(t)) return "Computer Room AC";
  if (/snow melt/.test(t)) return "Snow Melt";
  return "Other";
}

// ---------- Numeric / unit extraction ----------

function parseNumeric(val: string | null | undefined): number | null {
  if (val == null) return null;
  const s = String(val).trim().replace(/,/g, "");
  if (!s || s === "—" || s === "-" || s === "N/A" || s === "n/a") return null;
  // pull first number
  const m = s.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

// ---------- Spec parsing ----------

type FlatSpec = {
  specId: string;
  type: string | null;
  value: string | null;
  unit: string | null;
  category: string | null;
  optionName: string | null;
  numeric: number | null;
};

function safeJson<T = any>(s: string | null | undefined): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/**
 * Walk a `raw_specs` blob (which may be a flat object or a nested kind=group)
 * and yield zero or more FlatSpec rows.
 */
function flattenRawSpecs(
  raw: any,
  base: { specId: string; optionName: string | null; categoryStack?: string[] } = {
    specId: "",
    optionName: null,
  }
): FlatSpec[] {
  if (!raw || typeof raw !== "object") return [];
  const out: FlatSpec[] = [];
  const stack = base.categoryStack || [];

  // Some kinds we've observed:
  //   { kind:"flat", type, value, unit, category }
  //   { kind:"group", category, items:[...] }
  //   { kind:"table", category, columns:[], rows:[[...]] }
  // and sometimes the top is just a flat object without `kind`.
  if (raw.kind === "group" && Array.isArray(raw.items)) {
    const cat = raw.category || raw.name || null;
    for (const item of raw.items) {
      out.push(
        ...flattenRawSpecs(item, {
          specId: base.specId,
          optionName: base.optionName,
          categoryStack: cat ? [...stack, cat] : stack,
        })
      );
    }
    return out;
  }
  if (raw.kind === "table" && Array.isArray(raw.rows)) {
    const cat = raw.category || raw.name || null;
    const cols: string[] = Array.isArray(raw.columns) ? raw.columns : [];
    for (const row of raw.rows) {
      if (!Array.isArray(row)) continue;
      // Treat first cell as the row label / type
      const [labelRaw, ...rest] = row;
      const label = labelRaw == null ? null : String(labelRaw);
      for (let i = 0; i < rest.length; i++) {
        const v = rest[i];
        if (v == null || v === "") continue;
        const colName = cols[i + 1] ?? cols[i] ?? null;
        out.push({
          specId: base.specId,
          type: label || colName || null,
          value: typeof v === "string" || typeof v === "number" ? String(v) : null,
          unit: null,
          category: cat || (stack.length ? stack.join(" / ") : null),
          optionName: base.optionName,
          numeric: parseNumeric(typeof v === "object" ? null : v),
        });
      }
    }
    return out;
  }

  // Default: treat as flat
  const category =
    raw.category || (stack.length ? stack.join(" / ") : null) || null;
  out.push({
    specId: base.specId,
    type: raw.type ?? null,
    value: raw.value == null ? null : String(raw.value),
    unit: raw.unit ?? null,
    category,
    optionName: base.optionName,
    numeric: parseNumeric(raw.value),
  });
  return out;
}

function parseRequirementRow(r: RawRequirement): FlatSpec[] {
  const optionName = r.option_name || null;
  const raw = safeJson<any>(r.raw_specs);
  if (raw) {
    const flats = flattenRawSpecs(raw, {
      specId: r.spec_id,
      optionName,
    });
    if (flats.length) return flats;
  }
  // Fallback to literal_* / type_name / unit_name
  return [
    {
      specId: r.spec_id,
      type: r.literal_type || r.type_name || null,
      value: r.literal_value || null,
      unit: r.literal_unit || r.unit_name || null,
      category: r.literal_category || null,
      optionName,
      numeric: parseNumeric(r.literal_value),
    },
  ];
}

// ---------- Main ----------

function main() {
  console.log("[build-data] reading CSVs from", DATA_DIR);
  const projects = readCsv<RawProject>(path.join(DATA_DIR, "Project.csv"));
  const equipment = readCsv<RawEquipment>(path.join(DATA_DIR, "Equipment.csv"));
  const requirements = readRequirementsCsv(
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
  const equipmentOut = equipment.map((e) => {
    const manuRaw = e.component_manufacturer_name || null;
    const bodRaw = e.bod_manufacturer_name || null;
    return {
      id: e.equipment_id,
      projectId: e.project_id,
      packageId: e.package_id || null,
      packageName: e.package || null,
      tag: e.equipment_tag || null,
      componentTypeId: e.component_type_id || null,
      componentTypeName: e.component_type_name || null,
      canonicalType: canonicalType(e.component_type_name, e.package),
      quantity: Number(e.quantity || 0) || 0,
      componentId: e.component_id || null,
      componentName: e.component_name || null,
      componentModel: e.component_model || null,
      manufacturerRaw: manuRaw,
      bodManufacturerRaw: bodRaw,
      manufacturer: canonicalManufacturer(manuRaw),
      bodManufacturer: canonicalManufacturer(bodRaw),
    };
  });

  // ---- Requirements grouped by equipment (with proper raw_specs parsing) ----
  const requirementsByEquipment: Record<string, FlatSpec[]> = {};
  let requirementSpecCount = 0;
  let requirementSpecWithType = 0;
  let requirementSpecWithValue = 0;
  for (const r of requirements) {
    if (!r.equipment_id) continue;
    const flats = parseRequirementRow(r);
    const arr =
      requirementsByEquipment[r.equipment_id] ||
      (requirementsByEquipment[r.equipment_id] = []);
    for (const f of flats) {
      // drop completely empty rows
      if (
        !f.type &&
        !f.value &&
        !f.optionName &&
        !f.category &&
        f.numeric == null
      )
        continue;
      arr.push(f);
      requirementSpecCount++;
      if (f.type) requirementSpecWithType++;
      if (f.value) requirementSpecWithValue++;
    }
  }
  console.log(
    `[build-data] flattened specs: total=${requirementSpecCount} withType=${requirementSpecWithType} withValue=${requirementSpecWithValue}`
  );

  // ---- Aggregates ----
  const manufacturerCounts = new Map<string, number>();
  const bodManufacturerCounts = new Map<string, number>();
  const componentTypeCounts = new Map<string, number>();
  const canonicalTypeCounts = new Map<Canon, number>();
  const equipmentByProject = new Map<string, number>();
  const manufacturersByProject = new Map<string, Set<string>>();
  const packagesByProject = new Map<string, Set<string>>();
  const componentTypesByProject = new Map<string, Set<string>>();
  const manuByType = new Map<string, Map<string, number>>();
  const manuByCanonical = new Map<Canon, Map<string, number>>();
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
    if (e.componentTypeName)
      bumpCount(componentTypeCounts, e.componentTypeName);
    bumpCount(canonicalTypeCounts, e.canonicalType);
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
    if (e.manufacturer) {
      const inner =
        manuByCanonical.get(e.canonicalType) || new Map<string, number>();
      bumpCount(inner, e.manufacturer);
      manuByCanonical.set(e.canonicalType, inner);
    }
    if (e.bodManufacturer && e.manufacturer) {
      if (e.bodManufacturer === e.manufacturer) {
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

  const topTypes = topN(componentTypeCounts, 12).map((x) => x.key);
  const marketShare = topTypes.map((type) => {
    const inner = manuByType.get(type) || new Map();
    const top = topN(inner, 8);
    const total = [...inner.values()].reduce((a, b) => a + b, 0);
    return { type, total, top };
  });

  const canonicalMarketShare = [...canonicalTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, total]) => {
      const inner = manuByCanonical.get(type) || new Map<string, number>();
      const top = topN(inner, 10);
      const totalSpecified = [...inner.values()].reduce((a, b) => a + b, 0);
      return { type, total, totalSpecified, top };
    });

  const aggregates = {
    totals: {
      projects: projectsOut.length,
      equipment: equipmentOut.length,
      requirements: requirements.length,
      flattenedSpecs: requirementSpecCount,
      uniqueManufacturers: manufacturerCounts.size,
      uniqueComponentTypes: componentTypeCounts.size,
      uniqueCanonicalTypes: canonicalTypeCounts.size,
    },
    topManufacturers: topN(manufacturerCounts, 20),
    topBodManufacturers: topN(bodManufacturerCounts, 20),
    topComponentTypes: topN(componentTypeCounts, 20),
    topCanonicalTypes: topN(canonicalTypeCounts, 20),
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
    canonicalMarketShare,
  };

  // ---- Per-manufacturer rollup (for /manufacturers/[name] deep-dive) ----
  const manuRollup = new Map<
    string,
    {
      count: number;
      projectIds: Set<string>;
      types: Map<string, number>;
      canonical: Map<Canon, number>;
      bodCount: number;
      bodMatchSelf: number;
      bodLostTo: Map<string, number>; // BOD=self, specified=other
      bodWonFrom: Map<string, number>; // specified=self, BOD=other
    }
  >();

  function ensureRollup(name: string) {
    let r = manuRollup.get(name);
    if (!r) {
      r = {
        count: 0,
        projectIds: new Set<string>(),
        types: new Map(),
        canonical: new Map(),
        bodCount: 0,
        bodMatchSelf: 0,
        bodLostTo: new Map(),
        bodWonFrom: new Map(),
      };
      manuRollup.set(name, r);
    }
    return r;
  }

  for (const e of equipmentOut) {
    if (e.manufacturer) {
      const r = ensureRollup(e.manufacturer);
      r.count++;
      r.projectIds.add(e.projectId);
      if (e.componentTypeName)
        r.types.set(
          e.componentTypeName,
          (r.types.get(e.componentTypeName) || 0) + 1
        );
      r.canonical.set(
        e.canonicalType,
        (r.canonical.get(e.canonicalType) || 0) + 1
      );
      // win-from
      if (e.bodManufacturer && e.bodManufacturer !== e.manufacturer) {
        r.bodWonFrom.set(
          e.bodManufacturer,
          (r.bodWonFrom.get(e.bodManufacturer) || 0) + 1
        );
      }
    }
    if (e.bodManufacturer) {
      const r = ensureRollup(e.bodManufacturer);
      r.bodCount++;
      r.projectIds.add(e.projectId);
      if (e.manufacturer && e.manufacturer === e.bodManufacturer) {
        r.bodMatchSelf++;
      } else if (e.manufacturer) {
        r.bodLostTo.set(
          e.manufacturer,
          (r.bodLostTo.get(e.manufacturer) || 0) + 1
        );
      }
    }
  }

  const perManufacturerSummary = [...manuRollup.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, v]) => {
      const winRate = v.bodCount ? v.bodMatchSelf / v.bodCount : null;
      return {
        name,
        count: v.count,
        bodCount: v.bodCount,
        bodMatchSelf: v.bodMatchSelf,
        winRate,
        projectCount: v.projectIds.size,
        projectIds: [...v.projectIds],
        componentTypes: [...v.types.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, c]) => ({ name: k, count: c })),
        canonicalTypes: [...v.canonical.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, c]) => ({ name: k, count: c })),
        bodLostTo: [...v.bodLostTo.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, c]) => ({ name: k, count: c })),
        bodWonFrom: [...v.bodWonFrom.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, c]) => ({ name: k, count: c })),
      };
    });

  // ---- LLM-friendly dataset summary ----
  const perProjectSummary = projectSummaries.map((p) => {
    const projEq = equipmentOut.filter((e) => e.projectId === p.id);
    const typeCounts = new Map<string, number>();
    const manuCounts = new Map<string, number>();
    for (const e of projEq) {
      if (e.componentTypeName) bumpCount(typeCounts, e.componentTypeName);
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

  const perTypeSummary = [...componentTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => {
      const inner = manuByType.get(type) || new Map<string, number>();
      return {
        name: type,
        count,
        manufacturers: [...inner.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => ({ name: k, count: v })),
      };
    });

  const datasetSummary = {
    description:
      "Summary of HVAC/MEP equipment-schedule data extracted from construction bid packages. Manufacturer names have been canonicalized.",
    schema: {
      project: ["id", "name", "createdAt", "equipmentCount", "packageCount"],
      componentType: ["name", "count", "manufacturers[]"],
      manufacturer: ["name", "count", "winRate", "projectCount", "componentTypes[]"],
    },
    totals: aggregates.totals,
    bod: {
      matches: aggregates.bod.matches,
      mismatches: aggregates.bod.mismatches,
      missing: aggregates.bod.missing,
    },
    projects: perProjectSummary,
    componentTypes: perTypeSummary,
    canonicalTypes: canonicalMarketShare,
    manufacturers: perManufacturerSummary.map((m) => ({
      name: m.name,
      count: m.count,
      bodCount: m.bodCount,
      winRate: m.winRate,
      projectCount: m.projectCount,
      componentTypes: m.componentTypes,
    })),
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
    path.join(OUT_DIR, "manufacturers.json"),
    JSON.stringify(perManufacturerSummary)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "dataset-summary.json"),
    JSON.stringify(datasetSummary)
  );

  console.log(`[build-data] wrote outputs to ${OUT_DIR}`);
}

main();
