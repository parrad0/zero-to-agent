"use client";

import type { Persona } from "@/lib/debate/personas";

interface AvatarOrbProps {
  persona: Persona;
  active: boolean;
  size?: number;
}

export function AvatarOrb({ persona, active, size = 180 }: AvatarOrbProps) {
  const { id, hue, accent } = persona;
  const gradId = `g-${id}`;
  const hazeId = `h-${id}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={`hsl(${hue}, 85%, 88%)`} />
          <stop offset="55%" stopColor={`hsl(${hue}, 65%, 72%)`} />
          <stop offset="100%" stopColor={`hsl(${hue}, 55%, 58%)`} />
        </radialGradient>
        <radialGradient id={hazeId} cx="50%" cy="50%" r="55%">
          <stop offset="60%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* outer ghost haze */}
      <circle cx="100" cy="100" r="98" fill={`url(#${hazeId})`} />

      {/* main orb */}
      <circle cx="100" cy="100" r="78" fill={`url(#${gradId})`} />

      {/* character silhouette */}
      <g filter={`url(#blur-${id})`} clipPath={`circle(78px at 100px 100px)`}>
        <Silhouette id={id} />
      </g>

      {/* highlight gloss */}
      <ellipse cx="78" cy="74" rx="22" ry="14" fill="white" opacity="0.35" />
      <ellipse cx="74" cy="68" rx="8" ry="5" fill="white" opacity="0.6" />
    </svg>
  );
}

function Silhouette({ id }: { id: string }) {
  switch (id) {
    case "einstein":
      return (
        <g>
          <path
            d="M55 95 C50 70, 70 55, 100 52 C130 55, 150 70, 145 95 C155 92, 162 100, 158 110 C150 108, 145 112, 142 115 C140 105, 135 100, 130 100 L70 100 C65 100, 60 105, 58 115 C55 112, 50 108, 42 110 C38 100, 45 92, 55 95 Z"
            fill="white" opacity="0.55"
          />
          <ellipse cx="100" cy="118" rx="28" ry="34" fill="white" opacity="0.35" />
          <path
            d="M86 132 C92 136, 108 136, 114 132 C112 138, 108 140, 100 140 C92 140, 88 138, 86 132 Z"
            fill="white" opacity="0.5"
          />
        </g>
      );
    case "nietzsche":
      return (
        <g>
          <path
            d="M65 90 C65 70, 80 58, 100 58 C120 58, 135 68, 138 88 C132 84, 125 84, 120 88 L80 88 C75 84, 70 84, 65 90 Z"
            fill="white" opacity="0.5"
          />
          <ellipse cx="100" cy="115" rx="26" ry="32" fill="white" opacity="0.32" />
          <path
            d="M70 128 C78 124, 90 126, 100 130 C110 126, 122 124, 130 128 C128 138, 118 144, 108 142 C104 141, 102 140, 100 138 C98 140, 96 141, 92 142 C82 144, 72 138, 70 128 Z"
            fill="white" opacity="0.6"
          />
        </g>
      );
    case "cleopatra":
      return (
        <g>
          <path
            d="M62 100 C62 72, 80 56, 100 56 C120 56, 138 72, 138 100 L138 130 C132 128, 128 128, 125 130 L125 110 C120 108, 115 108, 110 110 L110 130 C105 128, 95 128, 90 130 L90 110 C85 108, 80 108, 75 110 L75 130 C72 128, 68 128, 62 130 Z"
            fill="white" opacity="0.5"
          />
          <ellipse cx="100" cy="112" rx="22" ry="28" fill="white" opacity="0.32" />
          <rect x="68" y="78" width="64" height="6" rx="2" fill="white" opacity="0.6" />
          <circle cx="100" cy="74" r="4" fill="white" opacity="0.7" />
        </g>
      );
    case "plato":
      return (
        <g>
          <path
            d="M55 82 Q60 68, 75 64 M145 82 Q140 68, 125 64"
            stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55"
          />
          <ellipse cx="68" cy="72" rx="6" ry="3" fill="white" opacity="0.5" transform="rotate(-30 68 72)" />
          <ellipse cx="132" cy="72" rx="6" ry="3" fill="white" opacity="0.5" transform="rotate(30 132 72)" />
          <path d="M70 92 C72 78, 84 70, 100 70 C116 70, 128 78, 130 92 Z" fill="white" opacity="0.45" />
          <ellipse cx="100" cy="112" rx="24" ry="28" fill="white" opacity="0.3" />
          <path
            d="M76 122 C78 138, 88 152, 100 154 C112 152, 122 138, 124 122 C118 128, 110 130, 100 130 C90 130, 82 128, 76 122 Z"
            fill="white" opacity="0.55"
          />
        </g>
      );
    default:
      return <circle cx="100" cy="100" r="40" fill="white" opacity="0.3" />;
  }
}
