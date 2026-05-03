import { NextResponse } from "next/server";
import { start, getRun } from "workflow/api";
import { getWorld } from "workflow/runtime";
import { debateWorkflow } from "@/app/workflows/debate";
import type { DebateEvent } from "@/lib/agents/types";
import { pickRandomTopic } from "@/lib/debate/config";
import {
  getDebateRunId,
  setDebateRunId,
  clearDebateRunId,
  clearDebateMessages,
} from "@/lib/kv/debate";

const API_KEY = process.env.DEBATE_API_KEY;

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === API_KEY && !!API_KEY;
}

export async function GET() {
  try {
    const runId = await getDebateRunId();

    if (!runId) {
      return NextResponse.json(
        { error: "No active debate", status: "idle" },
        { status: 503 }
      );
    }

    const run = getRun(runId);

    let exists = false;
    try {
      exists = await Promise.race([
        run.exists,
        new Promise<false>((resolve) => setTimeout(() => resolve(false), 5000)),
      ]);
    } catch {
      exists = false;
    }

    if (!exists) {
      await clearDebateRunId();
      return NextResponse.json(
        { error: "Debate not found", status: "not_found" },
        { status: 404 }
      );
    }

    const runStatus = await run.status;

    if (runStatus === "failed" || runStatus === "cancelled") {
      await clearDebateRunId();
      return NextResponse.json(
        { error: "No active debate", status: "idle" },
        { status: 503 }
      );
    }

    if (runStatus === "completed") {
      // Don't clear KV — scheduleNextSession already wrote the new runId.
      // The client will retry and pick up the new run on the next poll.
      return NextResponse.json(
        { error: "Debate ended", status: "idle" },
        { status: 503 }
      );
    }

    const readable = await run.getReadable<DebateEvent>({ startIndex: -500 });
    const encoder = new TextEncoder();

    // Use ReadableStream constructor with explicit cancel() so that
    // client disconnects are handled gracefully without unhandled rejections.
    let reader: ReadableStreamDefaultReader<DebateEvent> | null = null;

    const jsonStream = new ReadableStream({
      start(controller) {
        reader = readable.getReader();

        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader!.read();
              if (done) {
                try { controller.close(); } catch { /* already closed */ }
                return;
              }
              controller.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
            }
          } catch {
            // Client disconnected or stream cancelled — close quietly.
            try { controller.close(); } catch { /* already closed */ }
          }
        };

        void pump();
      },
      cancel() {
        // Called when the client disconnects (ResponseAborted).
        reader?.cancel().catch(() => {});
      },
    });

    return new Response(jsonStream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Run-Id": runId,
        "X-Run-Status": runStatus,
      },
    });
  } catch (error) {
    console.error("[debate] GET error", error);
    return NextResponse.json(
      { error: "Unable to stream debate" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // ignore empty body
    }

    const forceRestart = body.force === true;

    const existingRunId = await getDebateRunId();
    if (existingRunId) {
      const existingRun = getRun(existingRunId);
      const existingExists = await existingRun.exists;
      if (existingExists) {
        const existingStatus = await existingRun.status;
        const isActive = existingStatus === "pending" || existingStatus === "running";
        if (isActive) {
          if (forceRestart) {
            await cancelRun(existingRunId);
          } else {
            return NextResponse.json(
              {
                error: "A debate is already active",
                runId: existingRunId,
                status: existingStatus,
                hint: "Pass force=true in the request body to stop it automatically",
              },
              { status: 409 }
            );
          }
        } else {
          await clearDebateRunId();
        }
      } else {
        await clearDebateRunId();
      }
    }

    const topic =
      typeof body.topic === "string" && body.topic.trim().length
        ? body.topic.trim()
        : pickRandomTopic();

    const run = await start(debateWorkflow, [topic]);
    await setDebateRunId(run.runId);

    return NextResponse.json({
      success: true,
      runId: run.runId,
      topic,
    });
  } catch (error) {
    console.error("[debate] POST error", error);
    return NextResponse.json(
      { error: "Unable to start debate" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const runId = await getDebateRunId();

    if (!runId) {
      return NextResponse.json(
        { error: "No active debate", status: "idle" },
        { status: 404 }
      );
    }

    await cancelRun(runId);

    return NextResponse.json({
      success: true,
      cancelledRunId: runId,
    });
  } catch (error) {
    console.error("[debate] DELETE error", error);
    return NextResponse.json(
      { error: "Unable to stop debate" },
      { status: 500 }
    );
  }
}

async function cancelRun(runId: string) {
  try {
    const world = await getWorld();
    await world.events.create(runId, { eventType: "run_cancelled" });
  } catch (err) {
    console.warn("[debate] could not cancel run via world events", err);
  }

  await clearDebateRunId();
  await clearDebateMessages();
}
