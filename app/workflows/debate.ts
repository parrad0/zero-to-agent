import { sleep } from "workflow";
import { start } from "workflow/api";
import { generateId } from "ai";
import { philosophers } from "@/lib/agents/philosophers";
import { PERSONAS } from "@/lib/debate/personas";
import { DEFAULT_SEED_TOPICS, pickRandomTopic } from "@/lib/debate/config";
import type { Message, DynamicSpeaker } from "@/lib/agents/types";
import { emit, now } from "@/lib/debate/workflow-utils";
import { generateReply, pickNextTopic, selectCast } from "@/lib/debate/workflow-service";
import { setDebateRunId } from "@/lib/kv/debate";

// 1 run = 1 debate = MESSAGES_PER_DEBATE speaker turns.
// When the debate ends, scheduleNextSession() starts a fresh independent run
// ("recursion across runs" pattern). Each run stays ~50-60 events,
// well under the 2 000-event replay performance cliff.
const MESSAGES_PER_DEBATE = 10; // ~2-3 full rounds with 4 speakers (testing)
const HISTORY_LIMIT = 30;
const SPEAKER_PAUSE_SECONDS = 2;
const BETWEEN_DEBATES_PAUSE_SECONDS = 10;

const DEFAULT_CAST: DynamicSpeaker[] = PERSONAS.map((persona) => {
  const phil = philosophers.find((p) => p.id === persona.id);
  return {
    id: persona.id,
    name: persona.name,
    short: persona.short,
    years: persona.years,
    systemPrompt:
      phil?.systemPrompt ??
      `You are ${persona.name}. Engage in philosophical debate. Respond in English, max 90 words.`,
  };
});

/**
 * @param initialTopic  Topic for this debate.
 * @param isRestart     True when started automatically after a previous debate.
 *                      Triggers the 20 s rating interlude before debating.
 */
export async function debateWorkflow(initialTopic?: string, isRestart = false) {
  "use workflow";

  const topic = initialTopic?.trim() || pickRandomTopic();

  // Between-debate interlude: gives viewers time to rate the previous debate.
  // Skipped on the very first run (or after a manual cron restart).
  if (isRestart) {
    await emit({
      type: "next_debate",
      topics: [topic],
      countdownMs: BETWEEN_DEBATES_PAUSE_SECONDS * 1000,
      timestamp: await now(),
    });
    await sleep(`${BETWEEN_DEBATES_PAUSE_SECONDS}s`);
    await emit({ type: "topic_change", topic });
  }

  let cast: DynamicSpeaker[];
  try {
    cast = await selectCast(topic);
  } catch {
    cast = DEFAULT_CAST;
  }

  await emit({ type: "cast_selected", speakers: cast });
  await announceTopic(topic, cast);

  const history: Message[] = [];
  let messageCount = 0;
  let round = 1;

  outer: while (true) {
    for (const speaker of cast) {
      if (messageCount >= MESSAGES_PER_DEBATE) break outer;
      await runSpeaker(speaker, topic, round, history);
      messageCount++;
    }
    round++;
  }

  await emit({
    type: "debate_complete",
    summary: "The debate has concluded. The philosophers rest.",
  });

  // Boot the next debate as an independent run so every debate has a clean
  // event log and the replay performance never degrades.
  await scheduleNextSession(pickNextTopic(topic, DEFAULT_SEED_TOPICS));
}

// start() must be called from a 'use step' function for deterministic replay.
async function scheduleNextSession(topic: string) {
  "use step";

  const run = await start(debateWorkflow, [topic, true]);
  // Update KV so /api/debate serves the new run to reconnecting clients.
  await setDebateRunId(run.runId);
}

async function runSpeaker(
  speaker: DynamicSpeaker,
  topic: string,
  round: number,
  history: Message[]
) {
  await emit({ type: "thinking", philosopherId: speaker.id });

  await emit({
    type: "speaker_start",
    philosopherId: speaker.id,
    topic,
    round,
    timestamp: await now(),
  });

  const reply = await generateReply(speaker, topic, history);
  const speakTs = await now();

  await emit({
    type: "speaker_message",
    philosopherId: speaker.id,
    content: reply,
    timestamp: speakTs,
  });

  const message: Message = {
    id: generateId(),
    philosopherId: speaker.id,
    speaker: speaker.name,
    avatar: "",
    content: reply,
    timestamp: speakTs,
  };

  history.push(message);
  if (history.length > HISTORY_LIMIT) {
    history.splice(0, history.length - HISTORY_LIMIT);
  }

  await emit({ type: "message", message });
  await emit({ type: "speaker_end", philosopherId: speaker.id, timestamp: await now() });
  await sleep(`${SPEAKER_PAUSE_SECONDS}s`);
}

async function announceTopic(topic: string, cast: DynamicSpeaker[]) {
  const timestamp = await now();
  await emit({
    type: "message",
    message: {
      id: generateId(),
      philosopherId: "system",
      speaker: "System",
      avatar: "🎭",
      content: `🎭 Debate: "${topic}"\nSpeakers: ${cast.map((s) => s.short).join(" → ")}`,
      timestamp,
    },
  });
}
