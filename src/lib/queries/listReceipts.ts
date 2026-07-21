import { prisma } from "@/lib/db/prisma";
import type { ReceiptListItem } from "@/lib/types/receipt";

/**
 * List all payment receipts, most recent first, as serializable DTOs. Real and
 * mock receipts are returned identically — the isMock flag drives the dev badge
 * in the UI (CLAUDE.md §6 / §16).
 */
export async function listReceipts(): Promise<ReceiptListItem[]> {
  const receipts = await prisma.paymentReceipt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      querySessionId: true,
      totalAmountUsd: true,
      status: true,
      txHash: true,
      providerReference: true,
      isMock: true,
      createdAt: true,
    },
  });

  return receipts.map((receipt) => ({
    id: receipt.id,
    querySessionId: receipt.querySessionId,
    totalAmountUsd: receipt.totalAmountUsd.toString(),
    status: receipt.status,
    txHash: receipt.txHash,
    providerReference: receipt.providerReference,
    isMock: receipt.isMock,
    createdAt: receipt.createdAt.toISOString(),
  }));
}
