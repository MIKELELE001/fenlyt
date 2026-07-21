import { NextResponse } from "next/server";
import { sourceSchema } from "@/lib/validation/source";
import { createSource } from "@/lib/queries/createSource";
import { listSourcesByOwner } from "@/lib/queries/listSources";
import { auth } from "@/lib/auth";
import type {
  CreateSourceResponse,
  ListSourcesResponse,
} from "@/lib/types/source";

// GET /api/sources — list the signed-in creator's own sources (most recent
// first). Ownership scoping is what makes this the creator's "My Sources" view.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ sources: [] }, { status: 401 });
  }

  try {
    const sources = await listSourcesByOwner(session.user.id);
    const body: ListSourcesResponse = { sources };
    return NextResponse.json(body);
  } catch (error) {
    console.error("[GET /api/sources] failed", error);
    return NextResponse.json({ sources: [] }, { status: 500 });
  }
}

// POST /api/sources — register a new source owned by the signed-in creator.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    const body: CreateSourceResponse = {
      success: false,
      error: "You must be signed in to register a source.",
    };
    return NextResponse.json(body, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: CreateSourceResponse = {
      success: false,
      error: "Invalid request body.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const parsed = sourceSchema.safeParse(payload);
  if (!parsed.success) {
    const body: CreateSourceResponse = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation failed.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const sourceId = await createSource(parsed.data, session.user.id);
    const body: CreateSourceResponse = { success: true, sourceId };
    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sources] failed", error);
    const body: CreateSourceResponse = {
      success: false,
      error: "Could not save source. Please try again.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
