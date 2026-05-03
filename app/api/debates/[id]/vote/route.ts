import { NextResponse } from "next/server";
import { castVote } from "@/lib/db/debates";
import { voteBodySchema } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = voteBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const counts = await castVote(id, result.data.kind);
  if (!counts) {
    return NextResponse.json({ error: "Debate not found or DB unavailable" }, { status: 404 });
  }
  return NextResponse.json(counts);
}
