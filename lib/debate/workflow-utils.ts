import { getWritable } from "workflow";
import type { DebateEvent } from "@/lib/agents/types";

export async function emit(event: DebateEvent) {
  "use step";
  const writer = getWritable<DebateEvent>().getWriter();
  try {
    // Silently drop the event if write stalls — keeps the run alive when no
    // consumer is connected and the internal buffer backs up.
    await Promise.race([
      writer.write(event),
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
  } finally {
    writer.releaseLock();
  }
}


export async function now() {
  "use step";
  return Date.now();
}

export async function closeStream() {
  "use step";
  await getWritable().close();
}
