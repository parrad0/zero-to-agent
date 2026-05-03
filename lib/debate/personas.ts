import type { DynamicSpeaker } from "@/lib/agents/types";

export interface Persona {
  id: string;
  name: string;
  short: string;
  years: string;
  hue: number;
  accent: string;
  bubbleBg: string;
  bubbleText: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "einstein",
    name: "Albert Einstein",
    short: "Einstein",
    years: "1879–1955",
    hue: 215,
    accent: "#7AA7E8",
    bubbleBg: "#EAF2FE",
    bubbleText: "#1B3A6B",
  },
  {
    id: "nietzsche",
    name: "Friedrich Nietzsche",
    short: "Nietzsche",
    years: "1844–1900",
    hue: 25,
    accent: "#E0A063",
    bubbleBg: "#FBEFE2",
    bubbleText: "#5C3B1A",
  },
  {
    id: "cleopatra",
    name: "Cleopatra",
    short: "Cleopatra",
    years: "69–30 BC",
    hue: 165,
    accent: "#6FB8A8",
    bubbleBg: "#E5F3EF",
    bubbleText: "#1F4D43",
  },
  {
    id: "plato",
    name: "Plato",
    short: "Plato",
    years: "428–348 BC",
    hue: 285,
    accent: "#A893D6",
    bubbleBg: "#EFEAF8",
    bubbleText: "#3D2A66",
  },
];

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export const SLOT_STYLES = [
  { hue: 215, accent: "#7AA7E8", bubbleBg: "#EAF2FE", bubbleText: "#1B3A6B" },
  { hue: 25,  accent: "#E0A063", bubbleBg: "#FBEFE2", bubbleText: "#5C3B1A" },
  { hue: 165, accent: "#6FB8A8", bubbleBg: "#E5F3EF", bubbleText: "#1F4D43" },
  { hue: 285, accent: "#A893D6", bubbleBg: "#EFEAF8", bubbleText: "#3D2A66" },
] as const;

export function buildPersona(speaker: DynamicSpeaker, slot: number): Persona {
  const style = SLOT_STYLES[slot % SLOT_STYLES.length];
  return { id: speaker.id, name: speaker.name, short: speaker.short, years: speaker.years, ...style };
}
