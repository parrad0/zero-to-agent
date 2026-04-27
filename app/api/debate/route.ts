import { NextRequest, NextResponse } from "next/server";
import { philosophers } from "@/lib/agents/philosophers";
import { streamDebate } from "@/lib/agents/debate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, philosophers: selectedIds, maxRounds = 3 } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 philosophers are required" },
        { status: 400 }
      );
    }

    const selectedPhilosophers = philosophers.filter((p) =>
      selectedIds.includes(p.id)
    );

    if (selectedPhilosophers.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid philosophers are required" },
        { status: 400 }
      );
    }

    const stream = await streamDebate({
      topic,
      selectedPhilosophers,
      maxRounds,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Debate API error:", error);
    return NextResponse.json(
      { error: "Failed to start debate" },
      { status: 500 }
    );
  }
}