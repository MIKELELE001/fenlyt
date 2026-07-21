import { prisma } from "@/lib/db/prisma";
import type { SourceFormValues } from "@/lib/validation/source";

/**
 * Persist a new source, owned by the creator who registered it. Prisma accepts
 * a string for the Decimal pricePerUseUsd column, preserving exact precision
 * for micropayments. Returns the new source id.
 */
export async function createSource(
  input: SourceFormValues,
  ownerId: string,
): Promise<string> {
  const source = await prisma.source.create({
    data: {
      title: input.title,
      authorName: input.authorName,
      sourceType: "TEXT",
      sourceUrl: input.sourceUrl ? input.sourceUrl : null,
      content: input.content,
      payoutAddress: input.payoutAddress,
      pricePerUseUsd: input.pricePerUseUsd,
      ownerId,
    },
    select: { id: true },
  });
  return source.id;
}
