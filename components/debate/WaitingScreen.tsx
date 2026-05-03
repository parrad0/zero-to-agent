"use client";

export function WaitingScreen() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #fafafa 0%, #f4f4f6 100%)",
        zIndex: 20,
        animation: "screen-fade-in 0.6s ease-out",
      }}
    >
      {/* Concentric pulse rings */}
      <div style={{ position: "relative", width: 100, height: 100, marginBottom: 36 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.1)",
              animation: `waiting-ring 2.8s ease-out ${i * 0.9}s infinite`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: "16px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e8e8ed 0%, #d1d1d6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
          }}
        >
          🎭
        </div>
      </div>

      <div
        style={{
          fontSize: "26px",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: "#1d1d1f",
          marginBottom: 8,
        }}
      >
        The Afterlife Forum
      </div>
      <div
        style={{
          fontSize: "15px",
          color: "#86868b",
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: 260,
        }}
      >
        The philosophers are gathering.
        <br />
        The next debate begins shortly.
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#c7c7cc",
              animation: `dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
