import { desc, eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { debates } from "./schema";
import type { DebateMessage } from "./schema";
import { getDb, ensureMigrated } from "./index";

export type DebateRow = InferSelectModel<typeof debates>;
export type { DebateMessage };

export async function saveDebate(
  id: string,
  topic: string,
  messages: DebateMessage[]
): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await ensureMigrated(db);
    await db
      .insert(debates)
      .values({ id, topic, messages })
      .onConflictDoUpdate({ target: debates.id, set: { messages } });
  } catch (err) {
    console.error("[db] saveDebate error", err);
  }
}

export async function listDebates(): Promise<DebateRow[]> {
  const db = getDb();
  if (!db) return [];
  try {
    await ensureMigrated(db);
    return db.select().from(debates).orderBy(desc(debates.createdAt)).limit(20);
  } catch (err) {
    console.error("[db] listDebates error", err);
    return [];
  }
}

export async function castVote(
  id: string,
  kind: "up" | "down"
): Promise<{ likes: number; dislikes: number } | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db
      .update(debates)
      .set(
        kind === "up"
          ? { likes: sql`${debates.likes} + 1` }
          : { dislikes: sql`${debates.dislikes} + 1` }
      )
      .where(eq(debates.id, id))
      .returning({ likes: debates.likes, dislikes: debates.dislikes });
    return rows[0] ?? null;
  } catch (err) {
    console.error("[db] castVote error", err);
    return null;
  }
}
