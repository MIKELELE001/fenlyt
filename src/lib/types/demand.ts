// Serializable demand-signal DTOs returned by GET /api/demand (CLAUDE.md hybrid
// extension). Dates are stringified at the query layer so the shape crosses the
// API boundary.

export type DemandSignalItem = {
  id: string;
  question: string;
  count: number;
  lastAskedAt: string;
};

export type ListDemandResponse = {
  signals: DemandSignalItem[];
};
