import { prisma } from "@/lib/db/prisma";
import type { SourceListItem } from "@/lib/types/source";

type SourceRow = {
  id: string;
  title: string;
  authorName: string;
  pricePerUseUsd: { toString(): string };
  createdAt: Date;
};

function toListItem(source: SourceRow): SourceListItem {
  return {
    id: source.id,
    title: source.title,
    authorName: source.authorName,
    pricePerUseUsd: source.pricePerUseUsd.toString(),
    createdAt: source.createdAt.toISOString(),
  };
}

const LIST_SELECT = {
  id: true,
  title: true,
  authorName: true,
  pricePerUseUsd: true,
  createdAt: true,
} as const;

/**
 * List every registered source, most recent first, as serializable DTOs.
 * Used by contexts that need the global pool (e.g. seeding, admin views).
 */
export async function listSources(): Promise<SourceListItem[]> {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    select: LIST_SELECT,
  });
  return sources.map(toListItem);
}

/**
 * List only the sources owned by a given creator, most recent first. Powers the
 * signed-in creator's "My Sources" view.
 */
export async function listSourcesByOwner(
  ownerId: string,
): Promise<SourceListItem[]> {
  const sources = await prisma.source.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: LIST_SELECT,
  });
  return sources.map(toListItem);
}
