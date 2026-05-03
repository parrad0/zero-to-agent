export interface Philosopher {
  id: string;
  name: string;
  systemPrompt: string;
}

export interface DynamicSpeaker {
  id: string;
  name: string;
  short: string;
  years: string;
  systemPrompt: string;
}

export interface Message {
  id: string;
  philosopherId: string;
  speaker: string;
  avatar: string;
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export type DebateEvent =
  | { type: "thinking"; philosopherId: string }
  | { type: "message"; message: Message }
  | { type: "timer"; remainingMs: number }
  | { type: "speaker_start"; philosopherId: string; topic: string; round: number; timestamp: number }
  | { type: "speaker_message"; philosopherId: string; content: string; timestamp: number }
  | { type: "speaker_end"; philosopherId: string; timestamp: number }
  | { type: "next_debate"; topics: string[]; countdownMs: number; timestamp: number }
  | { type: "topic_change"; topic: string }
  | { type: "debate_complete"; summary: string }
  | { type: "error"; error: string }
  | { type: "cast_selected"; speakers: DynamicSpeaker[] };
