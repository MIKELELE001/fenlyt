import { prisma } from "@/lib/db/prisma";

// Persist a new QuerySession with its question + generated answer. The session
// starts in GENERATED status (CLAUDE.md §10 step 8); markSessionComplete
// promotes it to PAID once settlement + receipt are recorded.
export type CreateQuerySessionInput = {
  question: string;
  answer: string;
  totalPaymentUsd: string;
};

export async function createQuerySession(
  input: CreateQuerySessionInput,
): Promise<string> {
  const session = await prisma.querySession.create({
    data: {
      question: input.question,
      answer: input.answer,
      totalPaymentUsd: input.totalPaymentUsd,
      status: "GENERATED",
    },
    select: { id: true },
  });
  return session.id;
}
