import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Message, DynamicSpeaker } from "@/lib/agents/types";

// Keep context window tight: enough for coherent debate without inflating costs.
// 8 recent turns = last 2 full rounds of 4 speakers — sufficient for continuity.
const MAX_HISTORY = 8;
// ~90 words * 1.3 tokens/word ≈ 117 tokens; 160 gives a buffer without waste.
const MAX_TOKENS_PER_REPLY = 160;

export async function generateReply(
  philosopher: { name: string; systemPrompt: string },
  topic: string,
  history: Message[]
) {
  "use step";

  const recent = history
    .slice(-MAX_HISTORY)
    .map((h) => `${h.speaker}: ${h.content}`)
    .join("\n");

  const prompt = `Setting: historical figures revived from the dead, placed together to debate.
Topic: "${topic}"

${recent ? `Recent exchanges:\n${recent}` : "(debate just started)"}

Respond as ${philosopher.name}. Be direct — no flattery, no restating what others said just to agree with it. If you disagree, say so plainly. React as yourself, not as a professor. Max 80 words.`;

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    system: philosopher.systemPrompt,
    prompt,
    temperature: 0.8,
    maxOutputTokens: MAX_TOKENS_PER_REPLY,
  });

  return result.text.trim().slice(0, 500);
}

export function pickNextTopic(current: string, pool: string[]): string {
  const filtered = pool.filter((t) => t !== current);
  const target = filtered.length ? filtered : pool;
  return target[Math.floor(Math.random() * target.length)];
}

export async function selectCast(topic: string): Promise<DynamicSpeaker[]> {
  "use step";

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "user" as const,
        content: `Choose 4 historical figures from very different eras, cultures, and fields to debate: "${topic}". Their worldviews should genuinely clash.

The premise: these figures have been abruptly revived from the dead and placed in a room together. They are disoriented but fully themselves — all memories and personality intact up to the moment they died.

For each figure write a systemPrompt that:
1. Opens with: "You are [Name]. You just woke up — revived from the dead, placed in a room with [other 3 names]. You died in [year/circa]. You remember everything up to then."
2. One sentence per co-debater about whether they would know of each other (based on real historical overlap). If no overlap: "You have never heard of [name]."
3. 2-3 sentences of raw personality — NOT academic style: how they actually speak, what irritates them, what drives them. No bullet points.
4. Ends with: "You are here to debate. No flattery. Disagree openly when you do. Max 80 words."

Return ONLY a valid JSON array of exactly 4 objects, no extra text:
[{"id":"slug","name":"Full Name","short":"Known Name","years":"YYYY–YYYY","systemPrompt":"..."}]

id: lowercase letters and underscores only. years: en-dash (–). Prioritize figures from very different centuries and regions.`,
      },
    ],
    temperature: 0.8,
  });

  const json = result.text.match(/\[[\s\S]*\]/)?.[0];
  if (!json) throw new Error("selectCast: no JSON array in response");
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("selectCast: invalid JSON in response");
  }
  if (!Array.isArray(parsed) || parsed.length < 4) throw new Error("selectCast: expected 4 speakers");
  return parsed.slice(0, 4).map((s) => ({
    id: String(s.id).toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
    name: String(s.name),
    short: String(s.short),
    years: String(s.years),
    systemPrompt: String(s.systemPrompt),
  }));
}
