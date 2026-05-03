import { getWritable } from "workflow";
import type { DebateEvent } from "@/lib/agents/types";

export async function emit(event: DebateEvent) {
  "use step";
  const writer = getWritable<DebateEvent>().getWriter();
  try {
    await writer.write(event);
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
