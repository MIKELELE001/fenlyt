import { prisma } from "@/lib/db/prisma";
import type { QuerySessionStatus } from "@prisma/client";

/**
 * Move a query session to its terminal status (CLAUDE.md §10 step 11): PAID
 * once settlement + receipt are recorded, or FAILED if payment could not be
 * completed.
 */
export async function markSessionComplete(
  querySessionId: string,
  status: QuerySessionStatus,
): Promise<void> {
  await prisma.querySession.update({
    where: { id: querySessionId },
    data: { status },
  });
}
