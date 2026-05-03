"use client";

import { useEffect, useRef, useState } from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  offset,
  FloatingPortal,
} from "@floating-ui/react";
import type { Persona } from "@/lib/debate/personas";
import { AvatarOrb } from "./AvatarOrb";
import { SpeechBubble } from "./SpeechBubble";

const DEACTIVATE_DELAY_MS = 2_000;
const BUBBLE_LINGER_MS = 4_000;
const TYPEWRITER_MS = 65; // ms per word — slow, readable

interface AvatarTileProps {
  persona: Persona;
  active: boolean;
  streamingText: string;
  sessionState: "live" | "closed";
  haloIntensity?: number;
  size?: number;
}

export function AvatarTile({
  persona,
  active,
  streamingText,
  sessionState,
  haloIntensity = 1.0,
  size = 180,
}: AvatarTileProps) {
  // Visually stays "active" (halo/scale/no dimming) for 2 s after active → false
  const [visuallyActive, setVisuallyActive] = useState(false);
  const deactivateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      if (deactivateRef.current) { clearTimeout(deactivateRef.current); deactivateRef.current = null; }
      setVisuallyActive(true);
    } else {
      deactivateRef.current = setTimeout(() => setVisuallyActive(false), DEACTIVATE_DELAY_MS);
    }
  }, [active]);

  useEffect(() => () => { if (deactivateRef.current) clearTimeout(deactivateRef.current); }, []);

  // Bubble: internal slow typewriter + linger
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const bubbleVisibleRef = useRef(false);
  bubbleVisibleRef.current = bubbleVisible;
  const lastFullTextRef = useRef("");
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lingerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set to true when speaker_end arrives while the typewriter is still running
  const pendingLingerRef = useRef(false);

  const startLinger = () => {
    if (lingerRef.current) clearTimeout(lingerRef.current);
    lingerRef.current = setTimeout(() => {
      setBubbleVisible(false);
      lastFullTextRef.current = "";
    }, BUBBLE_LINGER_MS);
  };

  useEffect(() => {
    if (streamingText && active && sessionState === "live") {
      // New speech — cancel any pending linger/typewriter and start fresh
      pendingLingerRef.current = false;
      if (lingerRef.current) { clearTimeout(lingerRef.current); lingerRef.current = null; }
      if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null; }

      lastFullTextRef.current = streamingText;
      setBubbleVisible(true);
      setIsTyping(true);

      const words = streamingText.split(/\s+/).filter(Boolean);
      let i = 0;
      typewriterRef.current = setInterval(() => {
        i++;
        setDisplayText(words.slice(0, i).join(" "));
        if (i >= words.length) {
          clearInterval(typewriterRef.current!);
          typewriterRef.current = null;
          setIsTyping(false);
          // If speaker_end already arrived while we were typing, start linger now
          if (pendingLingerRef.current) {
            pendingLingerRef.current = false;
            startLinger();
          }
        }
      }, TYPEWRITER_MS);

    } else if (!streamingText && sessionState === "live") {
      // speaker_end arrived — stop cursor but let typewriter finish naturally
      setIsTyping(false);
      if (typewriterRef.current) {
        // Typewriter still running: mark it so linger starts when it finishes
        pendingLingerRef.current = true;
      } else {
        // Already done: start linger now
        if (bubbleVisibleRef.current || lastFullTextRef.current) startLinger();
      }

    } else if (sessionState !== "live") {
      pendingLingerRef.current = false;
      if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null; }
      if (lingerRef.current) { clearTimeout(lingerRef.current); lingerRef.current = null; }
      setBubbleVisible(false);
      setIsTyping(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingText, active, sessionState]);

  useEffect(() => () => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    if (lingerRef.current) clearTimeout(lingerRef.current);
  }, []);

  // Smart floating bubble: escapes overflow:hidden, auto-flips when near viewport edge
  const { refs, floatingStyles, placement } = useFloating({
    placement: "top",
    open: bubbleVisible,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(22),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const showHalo = visuallyActive && sessionState === "live";
  const haloRgb = persona.accent;
  const dimmed = sessionState === "live" ? !visuallyActive : false;

  const haloOpacityHex = Math.round(0x40 * haloIntensity)
    .toString(16)
    .padStart(2, "0");

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        opacity: dimmed ? 0.5 : sessionState === "closed" ? 0.78 : 1,
        filter: dimmed ? "saturate(0.7)" : "none",
        transition: "opacity 400ms ease, filter 400ms ease, transform 400ms ease",
        transform: visuallyActive && sessionState === "live" ? "scale(1.0)" : "scale(0.96)",
      }}
    >
      {/* Speech bubble rendered in a portal — escapes overflow:hidden parents
          and auto-repositions when the avatar is near a viewport edge */}
      <FloatingPortal>
        <SpeechBubble
          ref={refs.setFloating}
          style={floatingStyles}
          placement={placement}
          persona={persona}
          text={displayText}
          visible={bubbleVisible}
          streaming={isTyping}
        />
      </FloatingPortal>

      {/* Avatar orb — the floating reference element */}
      <div
        ref={refs.setReference}
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showHalo && (
          <>
            <div
              style={{
                position: "absolute",
                inset: "-30px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${haloRgb}${haloOpacityHex} 0%, transparent 65%)`,
                animation: "halo-pulse 2.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "50%",
                border: `1.5px solid ${haloRgb}88`,
                animation: "halo-ring 2.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </>
        )}
        <AvatarOrb persona={persona} active={visuallyActive} size={size} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 590,
            letterSpacing: "-0.01em",
            color: "#1d1d1f",
          }}
        >
          {persona.short}
        </div>
        <div style={{ fontSize: "12px", color: "#86868b", fontWeight: 400, marginTop: "2px" }}>
          {persona.years}
        </div>
      </div>
    </div>
  );
}
