import { prisma } from "@/lib/db/prisma";

// Full source record including content + payment fields, used by the
// x402-protected content endpoint and the ask pipeline.
export type SourceWithContent = {
  id: string;
  title: string;
  authorName: string;
  content: string;
  payoutAddress: string;
  pricePerUseUsd: string;
};

export async function getSourceById(
  id: string,
): Promise<SourceWithContent | null> {
  const source = await prisma.source.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorName: true,
      content: true,
      payoutAddress: true,
      pricePerUseUsd: true,
    },
  });

  if (!source) return null;

  return {
    id: source.id,
    title: source.title,
    authorName: source.authorName,
    content: source.content,
    payoutAddress: source.payoutAddress,
    pricePerUseUsd: source.pricePerUseUsd.toString(),
  };
}
