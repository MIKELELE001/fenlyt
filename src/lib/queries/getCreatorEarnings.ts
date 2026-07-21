import { prisma } from "@/lib/db/prisma";
import { sumUsd } from "@/lib/format/usd";
import type { CreatorEarnings } from "@/lib/types/earnings";

/**
 * Compute a creator's earnings from their registered sources. A source earns
 * its pricePerUseUsd each time it's cited in a PAID query session (mock or real
 * — both represent a settled use). Returns a per-source breakdown plus totals.
 */
export async function getCreatorEarnings(
  ownerId: string,
): Promise<CreatorEarnings> {
  const sources = await prisma.source.findMany({
    where: { ownerId },
    select: {
      id: true,
      title: true,
      pricePerUseUsd: true,
      citations: {
        where: { querySession: { status: "PAID" } },
        select: { id: true },
      },
    },
  });

  const perSource = sources.map((source) => {
    const uses = source.citations.length;
    const price = source.pricePerUseUsd.toString();
    const earned = sumUsd(Array(uses).fill(price));
    return { sourceId: source.id, title: source.title, uses, earned };
  });

  const totalEarned = sumUsd(perSource.map((s) => s.earned));
  const totalUses = perSource.reduce((sum, s) => sum + s.uses, 0);

  return { perSource, totalEarned, totalUses };
}
