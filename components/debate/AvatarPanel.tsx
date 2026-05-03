"use client";

import { type Persona } from "@/lib/debate/personas";
import { AvatarTile } from "./AvatarTile";
import { StatusPill } from "./StatusPill";

interface AvatarPanelProps {
  activeSpeakerId: string | null;
  streamingText: string;
  topic: string;
  sessionState: "live" | "closed";
  cast: Persona[];
}

export function AvatarPanel({
  activeSpeakerId,
  streamingText,
  topic,
  sessionState,
  cast,
}: AvatarPanelProps) {
  return (
    <div
      style={{
        flex: "3 1 0",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #fafafa 0%, #f4f4f6 100%)",
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "28px 40px 0 80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#86868b",
            }}
          >
            {sessionState === "live" ? "Today's Debate" : "Debate"}
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#1d1d1f",
              marginTop: "4px",
              lineHeight: 1.15,
            }}
          >
            {topic || "The Afterlife Forum"}
          </div>
        </div>
        <StatusPill sessionState={sessionState} />
      </div>

      {/* Avatar grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "40px",
          padding: "60px",
          placeItems: "center",
        }}
      >
        {cast.map((p) => (
          <AvatarTile
            key={p.id}
            persona={p}
            active={activeSpeakerId === p.id}
            streamingText={activeSpeakerId === p.id ? streamingText : ""}
            sessionState={sessionState}
          />
        ))}
      </div>
    </div>
  );
}
