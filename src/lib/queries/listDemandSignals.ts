import { prisma } from "@/lib/db/prisma";
import type { DemandSignalItem } from "@/lib/types/demand";

/**
 * List unmet-topic demand signals as serializable DTOs, most-requested first
 * (CLAUDE.md hybrid extension). Drives the /demand board so creators can see
 * what people ask about that no registered source answers yet.
 */
export async function listDemandSignals(): Promise<DemandSignalItem[]> {
  const signals = await prisma.demandSignal.findMany({
    orderBy: [{ count: "desc" }, { lastAskedAt: "desc" }],
    select: {
      id: true,
      question: true,
      count: true,
      lastAskedAt: true,
    },
  });

  return signals.map((signal) => ({
    id: signal.id,
    question: signal.question,
    count: signal.count,
    lastAskedAt: signal.lastAskedAt.toISOString(),
  }));
}
