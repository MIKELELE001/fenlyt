import { NextResponse } from "next/server";
import { listReceipts } from "@/lib/queries/listReceipts";
import type { ListReceiptsResponse } from "@/lib/types/receipt";

// GET /api/receipts — list all payment receipts (most recent first).
export async function GET() {
  try {
    const receipts = await listReceipts();
    const body: ListReceiptsResponse = { receipts };
    return NextResponse.json(body);
  } catch (error) {
    console.error("[GET /api/receipts] failed", error);
    return NextResponse.json({ receipts: [] }, { status: 500 });
  }
}
