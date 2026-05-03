import { kv } from "@vercel/kv";
import type { Message } from "@/lib/agents/types";

const KV_KEYS = {
  runId: "debate:runId",
  messages: "debate:messages",
} as const;

function isKvAvailable(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

export async function getDebateRunId(): Promise<string | null> {
  if (!isKvAvailable()) return null;
  try {
    return kv.get(KV_KEYS.runId);
  } catch {
    return null;
  }
}

export async function setDebateRunId(runId: string): Promise<void> {
  if (!isKvAvailable()) return;
  try {
    await kv.set(KV_KEYS.runId, runId);
  } catch {
    // ignore
  }
}

export async function clearDebateRunId(): Promise<void> {
  if (!isKvAvailable()) return;
  try {
    await kv.del(KV_KEYS.runId);
  } catch {
    // ignore
  }
}

export async function getDebateMessages(): Promise<Message[]> {
  if (!isKvAvailable()) return [];
  try {
    const raw = await kv.lrange<string>(KV_KEYS.messages, 0, 29);
    if (!raw) return [];
    return raw
      .map((item) => {
        try {
          return JSON.parse(item) as Message;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Message[];
  } catch {
    return [];
  }
}

export async function appendDebateMessage(message: Message): Promise<void> {
  if (!isKvAvailable()) return;
  try {
    await kv.lpush(KV_KEYS.messages, JSON.stringify(message));
    await kv.ltrim(KV_KEYS.messages, 0, 29);
  } catch {
    // ignore
  }
}

export async function clearDebateMessages(): Promise<void> {
  if (!isKvAvailable()) return;
  try {
    await kv.del(KV_KEYS.messages);
  } catch {
    // ignore
  }
}
