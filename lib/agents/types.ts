export interface Philosopher {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
  borderColor: string;
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

export interface DebateState {
  id: string;
  topic: string;
  messages: Message[];
  philosophers: Philosopher[];
  status: "idle" | "running" | "paused" | "complete";
  currentSpeakerIndex: number;
  rounds: number;
  maxRounds: number;
}

export interface DebateResponse {
  stream: ReadableStream;
  philosopherId: string;
}

export type DebateEvent = 
  | { type: "thinking"; philosopherId: string }
  | { type: "message"; message: Message }
  | { type: "round_complete"; round: number }
  | { type: "debate_complete"; summary: string }
  | { type: "error"; error: string };