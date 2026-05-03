import { pgTable, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

// ── Drizzle table ──────────────────────────────────────────────────────────

export const debates = pgTable("debates", {
  id:        text("id").primaryKey(),
  topic:     text("topic").notNull(),
  messages:  jsonb("messages").$type<DebateMessage[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  likes:     integer("likes").notNull().default(0),
  dislikes:  integer("dislikes").notNull().default(0),
});

// ── Zod schemas ────────────────────────────────────────────────────────────

export const debateMessageSchema = z.object({
  philosopherId: z.string(),
  speaker:       z.string().optional(),
  content:       z.string(),
});

export type DebateMessage = z.infer<typeof debateMessageSchema>;

export const saveDebateBodySchema = z.object({
  topic:    z.string().min(1),
  messages: z.array(debateMessageSchema).min(1),
});

export const voteBodySchema = z.object({
  kind: z.enum(["up", "down"]),
});
