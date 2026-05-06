import specTypesJson from "./generated/spec-types.json";

export type SpecTypeStat = {
  type: string;
  canonicalType: string;
  componentType: string | null;
  count: number;
  distinctEquipment: number;
  numeric: {
    count: number;
    min: number | null;
    max: number | null;
    avg: number;
  } | null;
  topUnits: Array<{ name: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
  topOptions: Array<{ name: string; count: number }>;
  sampleValues: Array<{ value: string; count: number }>;
};

const data = specTypesJson as {
  global: SpecTypeStat[];
  byCanonical: SpecTypeStat[];
};

export const specTypesGlobal = data.global;
export const specTypesByCanonical = data.byCanonical;

export function specTypeSlug(t: string): string {
  return encodeURIComponent(t.toLowerCase().replace(/[^a-z0-9]+/gi, "-"));
}

export function specTypeFromSlug(slug: string): SpecTypeStat | undefined {
  const decoded = decodeURIComponent(slug);
  return specTypesGlobal.find((s) => specTypeSlug(s.type) === decoded);
}
