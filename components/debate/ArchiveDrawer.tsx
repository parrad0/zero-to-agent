"use client";

export interface PastDebate {
  id: string;
  topic: string;
  date: string;
  likes: number;
  dislikes: number;
  messages: Array<{ philosopherId: string; speaker?: string; content: string }>;
}

export interface VoteState {
  likes: number;
  dislikes: number;
  myVote: "up" | "down" | null;
}

interface DrawerItemProps {
  label: string;
  sub: string;
  badge?: "live";
  likes?: number;
  dislikes?: number;
  myVote?: "up" | "down" | null;
  active: boolean;
  onClick: () => void;
}

function DrawerItem({
  label,
  sub,
  badge,
  likes,
  dislikes,
  myVote,
  active,
  onClick,
}: DrawerItemProps) {
  const hasVotes = typeof likes === "number" && typeof dislikes === "number";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 22px",
        background: active ? "rgba(0,122,255,0.08)" : "transparent",
        border: "none",
        borderLeft: active ? "3px solid #007AFF" : "3px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "background 140ms ease",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 550,
            color: "#1d1d1f",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#86868b",
            marginTop: "3px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{sub}</span>
          {hasVotes && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  color: myVote === "up" ? "#34C759" : "#86868b",
                  fontWeight: myVote === "up" ? 600 : 500,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0l4-7a2.5 2.5 0 0 1 2.4 3.2L12.5 10h5.8a2 2 0 0 1 2 2.4l-1.4 6a2 2 0 0 1-2 1.6H7" />
                </svg>
                {likes!.toLocaleString()}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  color: myVote === "down" ? "#FF3B30" : "#86868b",
                  fontWeight: myVote === "down" ? 600 : 500,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ transform: "rotate(180deg)" }}
                >
                  <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0l4-7a2.5 2.5 0 0 1 2.4 3.2L12.5 10h5.8a2 2 0 0 1 2 2.4l-1.4 6a2 2 0 0 1-2 1.6H7" />
                </svg>
                {dislikes!.toLocaleString()}
              </span>
            </span>
          )}
        </div>
      </div>
      {badge === "live" && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#34c759",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#34c759",
              boxShadow: "0 0 6px #34c75988",
              animation: "live-pulse 1.6s ease-in-out infinite",
            }}
          />
          Live
        </span>
      )}
    </button>
  );
}

interface ArchiveDrawerProps {
  open: boolean;
  onClose: () => void;
  currentView: string;
  liveTopic: string;
  liveVotes: VoteState;
  pastDebates: PastDebate[];
  onSelect: (id: string) => void;
  onSelectLive: () => void;
}

export function ArchiveDrawer({
  open,
  onClose,
  currentView,
  liveTopic,
  liveVotes,
  pastDebates,
  onSelect,
  onSelectLive,
}: ArchiveDrawerProps) {
  return (
    <>
      {/* scrim */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.32)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 220ms ease",
          zIndex: 90,
        }}
      />

      {/* panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(340px, 86vw)",
          background: "#ffffff",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "20px 22px 14px 22px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#86868b",
              }}
            >
              Afterlife Forum
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginTop: "4px",
                color: "#1d1d1f",
              }}
            >
              Debates
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#86868b",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "8px 0" }}>
          <DrawerItem
            label={liveTopic || "Live Debate"}
            sub="Now · Live"
            badge="live"
            likes={liveVotes.likes}
            dislikes={liveVotes.dislikes}
            myVote={liveVotes.myVote}
            active={currentView === "live"}
            onClick={() => {
              onSelectLive();
              onClose();
            }}
          />

          {pastDebates.length > 0 && (
            <div
              style={{
                padding: "16px 22px 6px 22px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#86868b",
              }}
            >
              Past Debates
            </div>
          )}

          {pastDebates.map((d) => (
            <DrawerItem
              key={d.id}
              label={d.topic}
              sub={d.date}
              likes={d.likes}
              dislikes={d.dislikes}
              active={currentView === d.id}
              onClick={() => {
                onSelect(d.id);
                onClose();
              }}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
