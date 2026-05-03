import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DebateEvent, Message } from "@/lib/agents/types";
import { buildPersona, PERSONAS, type Persona } from "@/lib/debate/personas";

type StageStatus = "idle" | "debating" | "next_debate" | "complete";

export interface NextDebateInfo {
  topic: string;
  endsAt: number;
}

interface UseDebateStreamResult {
  topic: string;
  messages: Message[];
  thinkingSet: Set<string>;
  activeSpeakerId: string | null;
  activeSpeech: string;
  stageStatus: StageStatus;
  remainingMs: number;
  nextDebate: NextDebateInfo | null;
  error: Error | null;
  cast: Persona[];
}

const MAX_MESSAGES = 500;
const IDLE_RETRY_MS = 5_000;
const DEBATE_DURATION_MS = 60 * 1000;
// Replayed historical events arrive in rapid bursts. Only events within this
// window are considered "live" — older ones update data state but never
// trigger speech bubbles (avoids every speaker showing a bubble on reconnect).
const LIVE_EVENT_WINDOW_MS = 8_000;

export function useDebateStream(): UseDebateStreamResult {
  const [topic, setTopic] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingSet, setThinkingSet] = useState<Set<string>>(new Set());
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [activeSpeech, setActiveSpeech] = useState<string>("");
  const [stageStatus, setStageStatus] = useState<StageStatus>("idle");
  const [remainingMs, setRemainingMs] = useState<number>(DEBATE_DURATION_MS);
  const [nextDebate, setNextDebate] = useState<NextDebateInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [cast, setCast] = useState<Persona[]>(PERSONAS);

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didUnmountRef = useRef(false);

  const clearStream = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => undefined);
      readerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleMessageEvent = useCallback((event: DebateEvent) => {
    switch (event.type) {
      case "thinking": {
        setThinkingSet((prev) => new Set([...prev, event.philosopherId]));
        break;
      }
      case "message": {
        setThinkingSet((prev) => {
          const next = new Set(prev);
          next.delete(event.message.philosopherId);
          return next;
        });
        setMessages((prev) => {
          const next = prev.concat(event.message);
          return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
        });
        if (event.message.philosopherId === "system") {
          const match = event.message.content.match(/"(.+?)"/);
          if (match) setTopic(match[1]);
        }
        break;
      }
      case "timer": {
        setRemainingMs(event.remainingMs);
        break;
      }
      case "cast_selected": {
        setCast(event.speakers.map((speaker, slot) => buildPersona(speaker, slot)));
        break;
      }
      case "speaker_start": {
        setActiveSpeakerId(event.philosopherId);
        setActiveSpeech("");
        setStageStatus("debating");
        setTopic(event.topic);
        break;
      }
      case "speaker_message": {
        if (Date.now() - event.timestamp < LIVE_EVENT_WINDOW_MS) {
          setActiveSpeech(event.content);
        }
        break;
      }
      case "speaker_end": {
        setActiveSpeech("");
        if (Date.now() - event.timestamp < LIVE_EVENT_WINDOW_MS) {
          setActiveSpeakerId((current) =>
            current === event.philosopherId ? null : current
          );
        }
        setThinkingSet((prev) => {
          const next = new Set(prev);
          next.delete(event.philosopherId);
          return next;
        });
        break;
      }
      case "topic_change": {
        setTopic(event.topic);
        setMessages([]);
        setThinkingSet(new Set());
        setActiveSpeech("");
        setActiveSpeakerId(null);
        setRemainingMs(DEBATE_DURATION_MS);
        setStageStatus("debating");
        setNextDebate(null);
        break;
      }
      case "next_debate": {
        setStageStatus("next_debate");
        setNextDebate({
          topic: event.topics[0] ?? "",
          endsAt: event.timestamp + event.countdownMs,
        });
        break;
      }
      case "debate_complete": {
        setStageStatus("complete");
        // Vercel Workflow streams can stay open after the run completes.
        // Force-cancel the reader so `finally` fires and triggers reconnect to the next run.
        setTimeout(() => {
          readerRef.current?.cancel().catch(() => {});
        }, 2_000);
        break;
      }
      case "error": {
        setError(new Error(event.error));
        break;
      }
      default:
        break;
    }
  }, []);

  const connectStream = useCallback(async () => {
    clearStream();

    try {
      const response = await fetch("/api/debate", { cache: "no-store" });

      if (response.status === 503) {
        // No active debate yet — keep waiting.
        setError(null);
        setStageStatus((s) => (s === "complete" ? s : "idle"));
        if (!didUnmountRef.current && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            void connectStream();
          }, IDLE_RETRY_MS);
        }
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("Stream body missing");

      setError(null);
      setMessages([]);

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";

      while (!didUnmountRef.current) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed) as DebateEvent;
            handleMessageEvent(event);
          } catch (err) {
            console.error("[debate] invalid event", err, trimmed);
          }
        }
      }
    } catch (err) {
      if (!didUnmountRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      readerRef.current = null;
      // Always reconnect after a stream ends — the server-side self-restart
      // means there will always be a new run coming. 503 retries handle the
      // brief gap between runs.
      if (!didUnmountRef.current && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          void connectStream();
        }, 1_500);
      }
    }
  }, [clearStream, handleMessageEvent]);

  useEffect(() => {
    didUnmountRef.current = false;
    void connectStream();
    return () => {
      didUnmountRef.current = true;
      clearStream();
    };
  }, [clearStream, connectStream]);

  return useMemo<UseDebateStreamResult>(
    () => ({
      topic,
      messages,
      thinkingSet,
      activeSpeakerId,
      activeSpeech,
      stageStatus,
      remainingMs,
      nextDebate,
      error,
      cast,
    }),
    [topic, messages, thinkingSet, activeSpeakerId, activeSpeech, stageStatus, remainingMs, nextDebate, error, cast]
  );
}
