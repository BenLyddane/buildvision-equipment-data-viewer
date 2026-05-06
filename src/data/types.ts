export type ProjectSummary = {
  id: string;
  name: string;
  createdAt: string | null;
  dueDate: string | null;
  nextBidDueDate: string | null;
  notes: string | null;
  equipmentCount: number;
  manufacturerCount: number;
  packageCount: number;
  componentTypeCount: number;
};

export type Equipment = {
  id: string;
  projectId: string;
  packageId: string | null;
  packageName: string | null;
  tag: string | null;
  componentTypeId: string | null;
  componentTypeName: string | null;
  canonicalType: string;
  quantity: number;
  componentId: string | null;
  componentName: string | null;
  componentModel: string | null;
  manufacturerRaw: string | null;
  bodManufacturerRaw: string | null;
  manufacturer: string | null;
  bodManufacturer: string | null;
};

export type Requirement = {
  specId: string;
  type: string | null;
  value: string | null;
  unit: string | null;
  category: string | null;
  optionName: string | null;
  numeric: number | null;
};

export type Aggregates = {
  totals: {
    projects: number;
    equipment: number;
    requirements: number;
    flattenedSpecs: number;
    uniqueManufacturers: number;
    uniqueComponentTypes: number;
    uniqueCanonicalTypes: number;
  };
  topManufacturers: Array<{ key: string; count: number }>;
  topBodManufacturers: Array<{ key: string; count: number }>;
  topComponentTypes: Array<{ key: string; count: number }>;
  topCanonicalTypes: Array<{ key: string; count: number }>;
  equipmentByProject: Array<{ projectId: string; count: number }>;
  bod: {
    matches: number;
    mismatches: number;
    missing: number;
    examples: Array<{
      equipmentId: string;
      projectId: string;
      componentType: string | null;
      bod: string;
      actual: string;
    }>;
  };
  marketShare: Array<{
    type: string;
    total: number;
    top: Array<{ key: string; count: number }>;
  }>;
  canonicalMarketShare: Array<{
    type: string;
    total: number;
    totalSpecified: number;
    top: Array<{ key: string; count: number }>;
  }>;
};

export type ManufacturerSummary = {
  name: string;
  count: number;
  bodCount: number;
  bodMatchSelf: number;
  winRate: number | null;
  projectCount: number;
  projectIds: string[];
  componentTypes: Array<{ name: string; count: number }>;
  canonicalTypes: Array<{ name: string; count: number }>;
  bodLostTo: Array<{ name: string; count: number }>;
  bodWonFrom: Array<{ name: string; count: number }>;
};
