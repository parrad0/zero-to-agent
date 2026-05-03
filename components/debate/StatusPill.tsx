"use client";

interface StatusPillProps {
  sessionState: "live" | "closed";
}

export function StatusPill({ sessionState }: StatusPillProps) {
  const isLive = sessionState === "live";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        background: isLive ? "rgba(255,255,255,0.7)" : "rgba(245,245,247,0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: "999px",
        border: "1px solid rgba(0,0,0,0.06)",
        fontSize: "12px",
        fontWeight: 500,
        color: isLive ? "#1d1d1f" : "#86868b",
        flexShrink: 0,
      }}
    >
      {isLive ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#34c759",
              boxShadow: "0 0 8px #34c75988",
              animation: "live-pulse 1.6s ease-in-out infinite",
            }}
          />
          Live in the afterlife
        </>
      ) : (
        <>
          <svg
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Session closed
        </>
      )}
    </div>
  );
}
