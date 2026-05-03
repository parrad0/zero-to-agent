"use client";

import { type ReactNode, useEffect, useRef } from "react";
import type { Message } from "@/lib/agents/types";
import { SLOT_STYLES, type Persona } from "@/lib/debate/personas";

function fallbackPersona(philosopherId: string, speaker?: string): Persona {
  const slot =
    philosopherId.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0) % 4;
  const style = SLOT_STYLES[slot];
  const displayName = speaker || philosopherId;
  return {
    id: philosopherId,
    name: displayName,
    short: displayName.split(" ")[0],
    years: "",
    hue: style.hue,
    accent: style.accent,
    bubbleBg: style.bubbleBg,
    bubbleText: style.bubbleText,
  };
}

interface ChatPanelProps {
  messages: Message[];
  activeSpeakerId: string | null;
  activeSpeech: string;
  sessionState: "live" | "closed";
  isMobile: boolean;
  headerSlot?: ReactNode;
  showTimestamps?: boolean;
  cast: Persona[];
}

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

interface ChatMessageProps {
  persona: Persona;
  text: string;
  timestamp: Date | null;
  showHeader: boolean;
  showTimestamp: boolean;
  streaming: boolean;
}

function ChatMessage({
  persona,
  text,
  timestamp,
  showHeader,
  showTimestamp,
  streaming,
}: ChatMessageProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginTop: showHeader ? "10px" : "2px",
        alignItems: "flex-end",
      }}
    >
      <div style={{ width: "28px", flexShrink: 0 }}>
        {showHeader && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, hsl(${persona.hue}, 80%, 85%), hsl(${persona.hue}, 60%, 65%))`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          maxWidth: "calc(100% - 40px)",
        }}
      >
        {showHeader && (
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: persona.bubbleText,
              marginBottom: "3px",
              marginLeft: "2px",
              letterSpacing: "-0.01em",
            }}
          >
            {persona.short}
          </div>
        )}
        <div
          style={{
            background: persona.bubbleBg,
            color: persona.bubbleText,
            padding: "8px 12px",
            borderRadius: "14px",
            borderTopLeftRadius: showHeader ? "4px" : "14px",
            fontSize: "14px",
            lineHeight: 1.4,
            fontWeight: 450,
            letterSpacing: "-0.005em",
            boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
            wordBreak: "break-word",
          }}
        >
          {text}
          {streaming && (
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "13px",
                background: persona.bubbleText,
                opacity: 0.5,
                marginLeft: "2px",
                verticalAlign: "text-bottom",
                animation: "cursor-blink 1s steps(2) infinite",
                borderRadius: "1px",
              }}
            />
          )}
        </div>
        {showTimestamp && timestamp && !streaming && (
          <div
            style={{
              fontSize: "10px",
              color: "#a1a1a6",
              marginTop: "2px",
              marginLeft: "4px",
              fontWeight: 400,
            }}
          >
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px 0" }}>
      <div
        style={{
          background: "rgba(0,0,0,0.05)",
          color: "#86868b",
          fontSize: "11px",
          fontWeight: 500,
          padding: "4px 12px",
          borderRadius: "999px",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ClosedFooter() {
  return (
    <div
      style={{
        marginTop: "20px",
        padding: "14px 16px",
        borderRadius: "14px",
        background: "rgba(0,0,0,0.03)",
        border: "1px solid rgba(0,0,0,0.06)",
        textAlign: "center",
        color: "#86868b",
        fontSize: "13px",
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: "#1d1d1f",
          marginBottom: "2px",
          letterSpacing: "-0.01em",
        }}
      >
        Debate archived
      </div>
      The next session begins shortly.
    </div>
  );
}

export function ChatPanel({
  messages,
  activeSpeakerId,
  activeSpeech,
  sessionState,
  isMobile,
  headerSlot,
  showTimestamps = true,
  cast,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeSpeech]);

  return (
    <div
      style={{
        flex: isMobile ? "1 1 auto" : "1 1 0",
        minWidth: isMobile ? 0 : "380px",
        maxWidth: isMobile ? "none" : "460px",
        display: "flex",
        flexDirection: "column",
        borderLeft: isMobile ? "none" : "1px solid rgba(0,0,0,0.08)",
        background: "#ffffff",
        minHeight: 0,
      }}
    >
      {headerSlot}

      {!isMobile && (
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex" }}>
            {cast.map((p, i) => (
              <div
                key={p.id}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, hsl(${p.hue}, 80%, 85%), hsl(${p.hue}, 60%, 65%))`,
                  border: "2px solid white",
                  marginLeft: i === 0 ? 0 : "-10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: "-0.01em",
              }}
            >
              Afterlife Forum
            </div>
            <div style={{ fontSize: "12px", color: "#86868b", marginTop: "1px" }}>
              4 minds · {sessionState === "live" ? "channeling" : "archived"}
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 18px 24px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          background: "#fbfbfd",
          minHeight: 0,
        }}
      >
        <DateDivider label={sessionState === "live" ? "Today" : "Archived"} />

        {messages.map((msg, i) => {
          const persona =
            cast.find((p) => p.id === msg.philosopherId) ??
            fallbackPersona(msg.philosopherId, msg.speaker);
          const prev = messages[i - 1];
          const isFirstFromSpeaker = !prev || prev.philosopherId !== msg.philosopherId;
          return (
            <ChatMessage
              key={msg.id || i}
              persona={persona}
              text={msg.content}
              timestamp={msg.timestamp ? new Date(msg.timestamp) : null}
              showHeader={isFirstFromSpeaker}
              showTimestamp={showTimestamps}
              streaming={false}
            />
          );
        })}

        {sessionState === "live" &&
          activeSpeakerId &&
          activeSpeech &&
          (() => {
            const persona =
              cast.find((p) => p.id === activeSpeakerId) ??
              fallbackPersona(activeSpeakerId);
            const last = messages[messages.length - 1];
            // Skip streaming overlay if the message was already committed to the list
            if (last?.philosopherId === activeSpeakerId && last?.content === activeSpeech) {
              return null;
            }
            const isFirstFromSpeaker = !last || last.philosopherId !== activeSpeakerId;
            return (
              <ChatMessage
                persona={persona}
                text={activeSpeech}
                timestamp={null}
                showHeader={isFirstFromSpeaker}
                showTimestamp={false}
                streaming={true}
              />
            );
          })()}

        {sessionState === "closed" && <ClosedFooter />}
      </div>
    </div>
  );
}
