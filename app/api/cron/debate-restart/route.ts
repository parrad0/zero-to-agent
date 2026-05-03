import { NextResponse } from "next/server";
import { start, getRun } from "workflow/api";
import { debateWorkflow } from "@/app/workflows/debate";
import { getDebateRunId, setDebateRunId } from "@/lib/kv/debate";
import { pickRandomTopic } from "@/lib/debate/config";

// Vercel automatically provides CRON_SECRET in the Authorization header
// for requests triggered by Vercel Cron Jobs.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingRunId = await getDebateRunId();

    if (existingRunId) {
      const existingRun = getRun(existingRunId);
      let isActive = false;
      try {
        const exists = await Promise.race([
          existingRun.exists,
          new Promise<false>((r) => setTimeout(() => r(false), 5_000)),
        ]);
        if (exists) {
          const status = await existingRun.status;
          isActive = status === "pending" || status === "running";
        }
      } catch {
        isActive = false;
      }

      if (isActive) {
        return NextResponse.json({ status: "active", runId: existingRunId });
      }
    }

    // No active debate — start a new one
    const topic = pickRandomTopic();
    const run = await start(debateWorkflow, [topic]);
    await setDebateRunId(run.runId);

    console.log(`[cron] started new debate — runId=${run.runId} topic="${topic}"`);
    return NextResponse.json({ status: "started", runId: run.runId, topic });
  } catch (error) {
    console.error("[cron] debate-restart error", error);
    return NextResponse.json({ error: "Failed to restart debate" }, { status: 500 });
  }
}
