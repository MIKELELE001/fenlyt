import { prisma } from "@/lib/db/prisma";
import type { PaymentStatus } from "@prisma/client";

// Persist a PaymentReceipt for a settled (or attempted) payment. Real and mock
// receipts are written identically (CLAUDE.md §6 / §10 step 10) — only the
// isMock flag distinguishes them.
export type CreateReceiptInput = {
  querySessionId: string;
  totalAmountUsd: string;
  status: PaymentStatus;
  txHash?: string | null;
  providerReference?: string | null;
  isMock: boolean;
};

export type CreatedReceipt = {
  id: string;
  status: PaymentStatus;
  txHash: string | null;
  isMock: boolean;
};

export async function createReceipt(
  input: CreateReceiptInput,
): Promise<CreatedReceipt> {
  const receipt = await prisma.paymentReceipt.create({
    data: {
      querySessionId: input.querySessionId,
      totalAmountUsd: input.totalAmountUsd,
      status: input.status,
      txHash: input.txHash ?? null,
      providerReference: input.providerReference ?? null,
      isMock: input.isMock,
    },
    select: { id: true, status: true, txHash: true, isMock: true },
  });
  return receipt;
}
