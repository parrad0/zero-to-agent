"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebateStream } from "@/hooks/useDebateStream";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AvatarPanel } from "@/components/debate/AvatarPanel";
import { ChatPanel } from "@/components/debate/ChatPanel";
import { ArchiveDrawer, type PastDebate } from "@/components/debate/ArchiveDrawer";
import { RatingScreen } from "@/components/debate/RatingScreen";
import { WaitingScreen } from "@/components/debate/WaitingScreen";
import { MobileHeader } from "@/components/debate/MobileHeader";
import type { Message } from "@/lib/agents/types";

const BETWEEN_DEBATES_SECONDS = 10;

function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      style={{
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "10px",
        cursor: "pointer",
        padding: 0,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path d="M1 1h16M1 7h16M1 13h16" stroke="#1d1d1f" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function Home() {
  const { topic, messages, thinkingSet, activeSpeakerId, activeSpeech, stageStatus, nextDebate, cast } =
    useDebateStream();

  const isMobile = useIsMobile(820);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<string>("live");
  const [pastDebates, setPastDebates] = useState<PastDebate[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // ID returned by POST /api/debates after saving — used for casting votes
  const [savedDebateId, setSavedDebateId] = useState<string | null>(null);
  // Local vote for the current debate (not synced across users — metadata only)
  const [myVote, setMyVote] = useState<"up" | "down" | null>(null);

  const topicRef = useRef(topic);
  const messagesRef = useRef(messages);
  topicRef.current = topic;
  messagesRef.current = messages;

  const savedRef = useRef<Set<string>>(new Set());

  // Reset vote when a new debate starts
  useEffect(() => {
    if (stageStatus === "debating") {
      setMyVote(null);
      setSavedDebateId(null);
    }
  }, [stageStatus]);

  // Load past debates on mount
  useEffect(() => {
    fetch("/api/debates")
      .then((r) => r.json())
      .then((data: PastDebate[]) => setPastDebates(data))
      .catch(() => {});
  }, []);

  // When a debate finishes: save to DB, get back the ID for voting
  useEffect(() => {
    if (stageStatus !== "complete") return;

    const t = topicRef.current;
    const m = messagesRef.current.filter((msg) => msg.philosopherId !== "system");
    const saveKey = `${t}|complete`;

    if (!t || m.length === 0 || savedRef.current.has(saveKey)) return;
    savedRef.current.add(saveKey);

    fetch("/api/debates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: t,
        messages: m.map((msg) => ({ philosopherId: msg.philosopherId, speaker: msg.speaker, content: msg.content })),
      }),
    })
      .then((r) => r.json())
      .then((data: { success: boolean; id?: string }) => {
        if (data.id) setSavedDebateId(data.id);
        // Refresh archive
        return fetch("/api/debates")
          .then((r) => r.json())
          .then((list: PastDebate[]) => setPastDebates(list));
      })
      .catch(() => {});
  }, [stageStatus]);

  const castVote = useCallback(
    (kind: "up" | "down") => {
      if (myVote || !savedDebateId) return;
      setMyVote(kind);
      fetch(`/api/debates/${encodeURIComponent(savedDebateId)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      }).catch(() => {});
    },
    [myVote, savedDebateId]
  );

  const isLiveView = viewing === "live";
  const sessionState: "live" | "closed" =
    isLiveView && stageStatus === "debating" ? "live" : "closed";
  const showRating = isLiveView && stageStatus === "next_debate" && !!nextDebate;

  useEffect(() => {
    if (!showRating || !nextDebate) { setSecondsLeft(0); return; }
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((nextDebate.endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [showRating, nextDebate]);

  const currentTopic = topic || "The Afterlife Forum";
  const nextTopic = nextDebate?.topic ?? "";

  const pastDebate = !isLiveView ? pastDebates.find((d) => d.id === viewing) : null;
  const displayMessages: Message[] = isLiveView
    ? messages
    : pastDebate
    ? pastDebate.messages.map((m, i) => ({
        id: `${m.philosopherId}-${i}`,
        philosopherId: m.philosopherId,
        speaker: m.speaker || m.philosopherId,
        avatar: "",
        content: m.content,
        timestamp: Date.now() - (pastDebate.messages.length - i) * 60000,
      }))
    : messages;

  const mobileHeader = isMobile ? (
    <MobileHeader
      topic={isLiveView ? currentTopic : (pastDebate?.topic ?? currentTopic)}
      sessionState={sessionState}
      onMenu={() => setDrawerOpen(true)}
    />
  ) : null;

  const ratingProps = {
    topic: currentTopic,
    nextTopic,
    secondsLeft,
    totalSeconds: BETWEEN_DEBATES_SECONDS,
    myVote,
    onVote: castVote,
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        color: "#1d1d1f",
        background: "#fff",
      }}
    >
      {/* Desktop */}
      {!isMobile && (
        <>
          <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 80 }}>
            <MenuButton onClick={() => setDrawerOpen(true)} />
          </div>
          <div style={{ flex: "3 1 0", position: "relative", display: "flex", minWidth: 0 }}>
            <AvatarPanel
              activeSpeakerId={isLiveView ? activeSpeakerId : null}
              streamingText={isLiveView ? activeSpeech : ""}
              topic={isLiveView ? currentTopic : (pastDebate?.topic ?? currentTopic)}
              sessionState={sessionState}
              cast={cast}
            />
            {isLiveView && (stageStatus === "idle" || stageStatus === "complete") && (
              <WaitingScreen />
            )}
            {showRating && <RatingScreen {...ratingProps} isMobile={false} />}
          </div>
        </>
      )}

      {/* Mobile */}
      {isMobile && showRating ? (
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {mobileHeader}
          <div style={{ flex: 1, position: "relative" }}>
            <RatingScreen {...ratingProps} isMobile={true} />
          </div>
        </div>
      ) : (
        <ChatPanel
          messages={displayMessages}
          thinkingSet={isLiveView ? thinkingSet : new Set()}
          activeSpeakerId={isLiveView ? activeSpeakerId : null}
          activeSpeech={isLiveView ? activeSpeech : ""}
          sessionState={isLiveView ? sessionState : "closed"}
          isMobile={isMobile}
          headerSlot={mobileHeader}
          cast={cast}
        />
      )}

      <ArchiveDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentView={viewing}
        liveTopic={currentTopic}
        liveVotes={{ likes: 0, dislikes: 0, myVote: null }}
        pastDebates={pastDebates}
        onSelect={(id) => setViewing(id)}
        onSelectLive={() => setViewing("live")}
      />
    </div>
  );
}
