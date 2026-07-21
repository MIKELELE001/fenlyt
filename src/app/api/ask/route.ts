import { NextResponse } from "next/server";
import { askSchema } from "@/lib/validation/ask";
import { runAskPipeline } from "@/lib/ask/runAskPipeline";
import type { AskResponse } from "@/lib/types/query";

// Resolve the absolute origin so the pipeline can call its own x402-protected
// content endpoint. Prefer the incoming request origin; fall back to the
// configured app URL for non-HTTP execution contexts.
function resolveBaseUrl(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
}

// POST /api/ask — the autonomous agentic pipeline (CLAUDE.md §10).
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: AskResponse = {
      success: false,
      error: "Invalid request body.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const parsed = askSchema.safeParse(payload);
  if (!parsed.success) {
    const body: AskResponse = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation failed.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const result = await runAskPipeline(
      parsed.data.question,
      resolveBaseUrl(request),
    );
    if (!result.success) {
      // Empty (no relevant sources) is a normal 200 outcome the UI renders as an
      // empty state; other failures are 500s.
      return NextResponse.json(result, { status: result.empty ? 200 : 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/ask] pipeline failed", error);
    const body: AskResponse = {
      success: false,
      error: "The agent could not complete this request. Please try again.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
