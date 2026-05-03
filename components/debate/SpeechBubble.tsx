"use client";

import { forwardRef, type CSSProperties } from "react";
import type { Persona } from "@/lib/debate/personas";

interface SpeechBubbleProps {
  persona: Persona;
  text: string;
  visible: boolean;
  streaming?: boolean;
  /** Placement returned by floating-ui (e.g. "top", "bottom", "top-start") */
  placement?: string;
  /** Positioning styles injected by floating-ui */
  style?: CSSProperties;
}

/**
 * Rendered inside a FloatingPortal — never clips against overflow:hidden parents.
 * Outer div handles floating-ui positioning; inner div drives the CSS animation.
 */
export const SpeechBubble = forwardRef<HTMLDivElement, SpeechBubbleProps>(
  ({ persona, text, visible, streaming = false, placement = "top", style }, ref) => {
    const isFlipped = placement.startsWith("bottom");

    return (
      <div
        ref={ref}
        style={{
          ...style,
          width: "max-content",
          maxWidth: "320px",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {/* Animation wrapper — scale from anchor edge so it feels attached */}
        <div
          style={{
            position: "relative",
            opacity: visible ? 1 : 0,
            transform: `scale(${visible ? 1 : 0.94})`,
            transformOrigin: isFlipped ? "top center" : "bottom center",
            transition: "opacity 400ms ease, transform 400ms ease",
          }}
        >
          <div
            style={{
              background: persona.bubbleBg,
              color: persona.bubbleText,
              padding: "14px 18px",
              borderRadius: "20px",
              fontSize: "15px",
              lineHeight: 1.45,
              fontWeight: 450,
              letterSpacing: "-0.01em",
              boxShadow: `0 8px 28px -10px ${persona.accent}55, 0 2px 8px rgba(0,0,0,0.04)`,
            }}
          >
            {text}
            {streaming && (
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "16px",
                  background: persona.bubbleText,
                  opacity: 0.6,
                  marginLeft: "3px",
                  verticalAlign: "text-bottom",
                  animation: "cursor-blink 1s steps(2) infinite",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>

          {/* Arrow pointing down toward the avatar (default: bubble above) */}
          {!isFlipped && (
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              style={{
                position: "absolute",
                left: "50%",
                top: "100%",
                transform: "translateX(-50%)",
                marginTop: "-1px",
              }}
            >
              <path d="M 0 0 L 10 12 L 20 0 Z" fill={persona.bubbleBg} />
            </svg>
          )}

          {/* Arrow pointing up toward the avatar (flipped: bubble below) */}
          {isFlipped && (
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              style={{
                position: "absolute",
                left: "50%",
                bottom: "100%",
                transform: "translateX(-50%) rotate(180deg)",
                marginBottom: "-1px",
              }}
            >
              <path d="M 0 0 L 10 12 L 20 0 Z" fill={persona.bubbleBg} />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

SpeechBubble.displayName = "SpeechBubble";
