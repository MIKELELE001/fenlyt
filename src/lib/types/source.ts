// Serializable source DTOs returned by the API (Prisma Decimal/Date are
// converted to strings at the query layer). See CLAUDE.md section 9.

export type SourceListItem = {
  id: string;
  title: string;
  authorName: string;
  pricePerUseUsd: string;
  createdAt: string;
};

export type ListSourcesResponse = {
  sources: SourceListItem[];
};

export type CreateSourceResponse =
  | { success: true; sourceId: string }
  | { success: false; error: string };
