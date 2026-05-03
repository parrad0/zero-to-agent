"use client";

function ThumbIcon({ up, filled, size = 36 }: { up: boolean; filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: up ? "none" : "rotate(180deg)" }}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3z" />
      <path d="M7 11l4-7a2.5 2.5 0 0 1 2.4 3.2L12.5 10h5.8a2 2 0 0 1 2 2.4l-1.4 6a2 2 0 0 1-2 1.6H7" />
    </svg>
  );
}

function CountdownRing({ seconds, total, size = 56 }: { seconds: number; total: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, seconds / total));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "17px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em",
      }}>
        {Math.ceil(seconds)}
      </div>
    </div>
  );
}

interface VoteButtonProps {
  kind: "up" | "down";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}

function VoteButton({ kind, active, disabled, onClick }: VoteButtonProps) {
  const up = kind === "up";
  const accent = up ? "#34C759" : "#FF3B30";
  const tint = up ? "#E8F8EC" : "#FDE9E7";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={up ? "Like this debate" : "Dislike this debate"}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "opacity 200ms ease, transform 120ms ease",
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: active ? accent : tint,
          color: active ? "#fff" : accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: active
            ? `0 8px 24px -6px ${accent}80, 0 2px 6px ${accent}30`
            : "0 1px 2px rgba(0,0,0,0.04)",
          transition: "background 200ms ease, color 200ms ease, box-shadow 240ms ease",
        }}
      >
        <ThumbIcon up={up} filled={active} size={40} />
      </div>
    </button>
  );
}

interface RatingScreenProps {
  topic: string;
  nextTopic: string;
  secondsLeft: number;
  totalSeconds: number;
  myVote: "up" | "down" | null;
  onVote: (kind: "up" | "down") => void;
  isMobile: boolean;
}

export function RatingScreen({
  topic,
  nextTopic,
  secondsLeft,
  totalSeconds,
  myVote,
  onVote,
  isMobile,
}: RatingScreenProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "32px 24px" : "48px",
        animation: "screen-fade-in 380ms ease",
        zIndex: 5,
      }}
    >
      <div style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "#86868b", marginBottom: "10px",
      }}>
        Debate ended
      </div>

      <div style={{
        fontSize: isMobile ? "24px" : "34px",
        fontWeight: 600, letterSpacing: "-0.025em", color: "#1d1d1f",
        textAlign: "center", maxWidth: "600px", lineHeight: 1.15, marginBottom: "8px",
      }}>
        {topic}
      </div>

      <div style={{
        fontSize: "15px", color: "#86868b", fontWeight: 400,
        marginBottom: isMobile ? "32px" : "44px",
        textAlign: "center", maxWidth: "340px", lineHeight: 1.4,
      }}>
        {myVote ? "Thanks for your feedback." : "How was the debate?"}
      </div>

      {/* Vote buttons — no counts shown, votes saved as metadata */}
      <div style={{ display: "flex", gap: isMobile ? "24px" : "32px", marginBottom: isMobile ? "40px" : "52px" }}>
        <VoteButton
          kind="up"
          active={myVote === "up"}
          disabled={!!myVote && myVote !== "up"}
          onClick={() => onVote("up")}
        />
        <VoteButton
          kind="down"
          active={myVote === "down"}
          disabled={!!myVote && myVote !== "down"}
          onClick={() => onVote("down")}
        />
      </div>

      {/* Next debate card */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "20px",
        padding: isMobile ? "18px" : "20px 22px",
        display: "flex", alignItems: "center", gap: "18px",
        width: isMobile ? "100%" : "auto",
        minWidth: isMobile ? 0 : "380px",
        maxWidth: "460px",
        boxShadow: "0 4px 14px -6px rgba(0,0,0,0.08)",
      }}>
        <CountdownRing seconds={secondsLeft} total={totalSeconds} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#86868b",
          }}>
            Next debate
          </div>
          <div style={{
            fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em",
            color: "#1d1d1f", marginTop: "2px", lineHeight: 1.2,
          }}>
            {nextTopic || "Coming up…"}
          </div>
        </div>
      </div>
    </div>
  );
}
