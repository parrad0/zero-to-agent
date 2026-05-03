import { philosophers } from "@/lib/agents/philosophers";

export const DEFAULT_PHILOSOPHER_IDS = philosophers.map((p) => p.id);

export const DEFAULT_SEED_TOPICS = [
  "Can humanity coexist with a superintelligent artificial intelligence?",
  "Is morality objective or a perpetual social construction?",
  "Does it make sense to speak of free will in a deterministic universe?",
  "Is the pursuit of happiness a right or a distraction?",
  "Can art exist without suffering?",
  "Does technological progress bring us closer to or further from meaning?",
  "What weighs more: historical memory or necessary forgetting?",
  "Can a machine understand beauty?",
  "Does it make sense to speak of identity in the digital age?",
  "Is utopia an inspiring ideal or an authoritarian trap?",
];

export function pickRandomTopic(exclude?: string): string {
  const pool = DEFAULT_SEED_TOPICS.filter((topic) => topic !== exclude);
  const target = pool.length ? pool : DEFAULT_SEED_TOPICS;
  return target[Math.floor(Math.random() * target.length)];
}
