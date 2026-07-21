import { NextResponse } from "next/server";
import { listDemandSignals } from "@/lib/queries/listDemandSignals";
import type { ListDemandResponse } from "@/lib/types/demand";

// GET /api/demand — list unmet-topic demand signals (most requested first).
export async function GET() {
  try {
    const signals = await listDemandSignals();
    const body: ListDemandResponse = { signals };
    return NextResponse.json(body);
  } catch (error) {
    console.error("[GET /api/demand] failed", error);
    return NextResponse.json({ signals: [] }, { status: 500 });
  }
}
