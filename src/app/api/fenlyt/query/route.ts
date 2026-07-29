import { NextResponse } from "next/server";
import { askSchema } from "@/lib/validation/ask";
import { runFenlytQuery } from "@/lib/fenlyt/runFenlytQuery";
import { createQuerySession } from "@/lib/queries/createQuerySession";
import { markSessionComplete } from "@/lib/queries/markSessionComplete";
import { prisma } from "@/lib/db/prisma";

export type FenlytQueryResponse =
  | {
      success: true;
      outOfScope: boolean;
      category: string | null;
      entity: string | null;
      answer: string;
      dataUsed: unknown;
      amountUsd: string;
      payment: { status: string; txHash: string | null; isMock: boolean } | null;
    }
  | { success: false; error: string };

// POST /api/fenlyt/query — classify, fetch CoinStats data, synthesize with
// Groq, charge the flat query fee. Replaces the old /api/ask citation flow.
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = askSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 },
    );
  }

  // Create a placeholder session up front so the pipeline has a
  // querySessionId to attach the payment/receipt to.
  const querySessionId = await createQuerySession({
    question: parsed.data.question,
    answer: "",
    totalPaymentUsd: "0.00",
  });

  try {
    const result = await runFenlytQuery(parsed.data.question, querySessionId);

    await prisma.querySession.update({
      where: { id: querySessionId },
      data: { answer: result.answer, totalPaymentUsd: result.amountUsd },
    });
    await markSessionComplete(
      querySessionId,
      result.outOfScope ? "UNSOURCED" : result.payment?.status === "SUCCEEDED" ? "PAID" : "FAILED",
    );

    const body: FenlytQueryResponse = {
      success: true,
      outOfScope: result.outOfScope,
      category: result.category,
      entity: result.entity,
      answer: result.answer,
      dataUsed: result.dataUsed,
      amountUsd: result.amountUsd,
      payment: result.payment,
    };
    return NextResponse.json(body);
  } catch (error) {
    console.error("[POST /api/fenlyt/query] pipeline failed", error);
    await markSessionComplete(querySessionId, "FAILED");
    const body: FenlytQueryResponse = {
      success: false,
      error: "Fenlyt could not complete this request. Please try again.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
