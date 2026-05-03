import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

let db: Db | null = null;
let migrated = false;

export function isDbAvailable(): boolean {
  return !!process.env.POSTGRES_URL;
}

export function getDb(): Db | null {
  if (!isDbAvailable()) return null;
  if (!db) {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function ensureMigrated(db: Db): Promise<void> {
  if (migrated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS debates (
      id          TEXT         PRIMARY KEY,
      topic       TEXT         NOT NULL,
      messages    JSONB        NOT NULL DEFAULT '[]'::jsonb,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      likes       INTEGER      NOT NULL DEFAULT 0,
      dislikes    INTEGER      NOT NULL DEFAULT 0
    )
  `);
  migrated = true;
}
