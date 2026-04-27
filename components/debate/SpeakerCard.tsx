"use client";

import { useEffect, useRef, type Message } from "react";
import type { Philosopher } from "@/lib/agents/types";

interface SpeakerCardProps {
  philosopher: Philosopher;
  messages: Message[];
  isThinking: boolean;
  isDebating: boolean;
}

export default function SpeakerCard({
  philosopher,
  messages,
  isThinking,
  isDebating,
}: SpeakerCardProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`
        rounded-xl border-2 overflow-hidden flex flex-col h-[500px]
        ${philosopher.borderColor}
        ${philosopher.color}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{philosopher.avatar}</span>
          <div>
            <h3 className="font-bold text-white">{philosopher.name}</h3>
            <p className="text-xs text-white/70">{philosopher.title}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
        {messages.length === 0 && !isThinking && (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/40 text-sm italic">Esperando...</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <p className="text-sm text-white/60">{message.speaker}</p>
            <p className="text-white/90 text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        ))}

        {isThinking && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">{philosopher.name}</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">
            {messages.length} intervenciones
          </span>
          {isThinking && (
            <span className="text-xs text-white/80 animate-pulse">
              ✍️ Pensando...
            </span>
          )}
          {isDebating && !isThinking && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      </div>
    </div>
  );
}