import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { listDebates, saveDebate } from "@/lib/db/debates";
import { saveDebateBodySchema } from "@/lib/db/schema";

function formatDate(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = saveDebateBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const id = randomUUID();
  await saveDebate(id, result.data.topic, result.data.messages);
  return NextResponse.json({ success: true, id });
}

export async function GET() {
  const rows = await listDebates();
  const debates = rows.map((d) => ({
    id: d.id,
    topic: d.topic,
    date: formatDate(new Date(d.createdAt)),
    likes: d.likes,
    dislikes: d.dislikes,
    messages: d.messages,
  }));
  return NextResponse.json(debates);
}
