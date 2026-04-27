"use client";

import type { Message, Philosopher } from "@/lib/agents/types";
import SpeakerCard from "./SpeakerCard";

interface DebateRoomProps {
  messages: Message[];
  philosophers: Philosopher[];
  thinkingPhilosophers: Set<string>;
  isDebating: boolean;
}

export default function DebateRoom({
  messages,
  philosophers,
  thinkingPhilosophers,
  isDebating,
}: DebateRoomProps) {
  // Get philosopher by ID
  const getPhilosopher = (id: string) =>
    philosophers.find((p) => p.id === id);

  // Group messages by philosopher
  const messagesByPhilosopher = new Map<string, Message[]>();
  philosophers.forEach((p) => {
    messagesByPhilosopher.set(
      p.id,
      messages.filter((m) => m.philosopherId === p.id)
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {philosophers.map((philosopher) => {
        const philosopherMessages = messagesByPhilosopher.get(philosopher.id) || [];
        const isThinking = thinkingPhilosophers.has(philosopher.id);

        return (
          <SpeakerCard
            key={philosopher.id}
            philosopher={philosopher}
            messages={philosopherMessages}
            isThinking={isThinking}
            isDebating={isDebating}
          />
        );
      })}
    </div>
  );
}