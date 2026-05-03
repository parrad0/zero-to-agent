"use client";

import { StatusPill } from "./StatusPill";

interface MobileHeaderProps {
  topic: string;
  sessionState: "live" | "closed";
  onMenu: () => void;
}

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
        flexShrink: 0,
      }}
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path
          d="M1 1h16M1 7h16M1 13h16"
          stroke="#1d1d1f"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export function MobileHeader({ topic, sessionState, onMenu }: MobileHeaderProps) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      <MenuButton onClick={onMenu} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#86868b",
          }}
        >
          {sessionState === "live" ? "Today's Debate" : "Debate"}
        </div>
        <div
          style={{
            fontSize: "17px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#1d1d1f",
            marginTop: "1px",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {topic || "The Afterlife Forum"}
        </div>
      </div>
      <StatusPill sessionState={sessionState} />
    </div>
  );
}
