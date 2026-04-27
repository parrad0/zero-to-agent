"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, Philosopher, DebateEvent } from "@/lib/agents/types";
import { philosophers } from "@/lib/agents/philosophers";
import { philosophers as allPhilosophers } from "@/lib/agents/philosophers";
import DebateRoom from "@/components/debate/DebateRoom";
import TopicInput from "@/components/debate/TopicInput";

export default function Home() {
  const [debateTopic, setDebateTopic] = useState<string>("");
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<Philosopher[]>(
    allPhilosophers.slice(0, 4)
  );
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingPhilosophers, setThinkingPhilosophers] = useState<Set<string>>(new Set());
  const [currentRound, setCurrentRound] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const togglePhilosopher = (philosopher: Philosopher) => {
    setSelectedPhilosophers((prev) => {
      const isSelected = prev.some((p) => p.id === philosopher.id);
      if (isSelected) {
        if (prev.length <= 2) return prev;
        return prev.filter((p) => p.id !== philosopher.id);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, philosopher];
      }
    });
  };

  const startDebate = async () => {
    if (!debateTopic.trim()) return;

    setIsDebating(true);
    setHasStarted(true);
    setMessages([]);
    setCurrentRound(0);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: debateTopic,
          philosophers: selectedPhilosophers.map((p) => p.id),
          maxRounds: 3,
        }),
      });

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as DebateEvent;
              handleDebateEvent(event);
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Debate error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          philosopherId: "error",
          speaker: "Error",
          avatar: "⚠️",
          content: "Algo salió mal. Intenta de nuevo.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsDebating(false);
      setThinkingPhilosophers(new Set());
    }
  };

  const handleDebateEvent = (event: DebateEvent) => {
    switch (event.type) {
      case "thinking":
        setThinkingPhilosophers((prev) => new Set([...prev, event.philosopherId]));
        break;
      case "message":
        setThinkingPhilosophers((prev) => {
          const next = new Set(prev);
          next.delete(event.message.philosopherId);
          return next;
        });
        setMessages((prev) => [...prev, event.message]);
        break;
      case "round_complete":
        setCurrentRound(event.round);
        break;
      case "debate_complete":
        setCurrentRound(event.round);
        break;
    }
  };

  const resetDebate = () => {
    setHasStarted(false);
    setMessages([]);
    setIsDebating(false);
    setCurrentRound(0);
    setThinkingPhilosophers(new Set());
  };

  if (!hasStarted) {
    return (
      <TopicInput
        philosophers={allPhilosophers}
        selectedPhilosophers={selectedPhilosophers}
        onToggle={togglePhilosopher}
        onStart={startDebate}
        isStarting={isDebating}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={resetDebate}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Nuevo Debate</span>
          </button>
          <h1 className="text-xl font-bold text-white">
            <span className="text-amber-500">The</span> Afterlife Forum
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Ronda {currentRound}/3</span>
            {isDebating && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {debateTopic}
          </h2>
        </div>
        <DebateRoom
          messages={messages}
          philosophers={selectedPhilosophers}
          thinkingPhilosophers={thinkingPhilosophers}
          isDebating={isDebating}
        />
        <div ref={messagesEndRef} />
      </main>
    </div>
  );
}