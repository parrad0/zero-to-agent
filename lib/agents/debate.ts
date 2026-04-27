import { generateText, type GenerateTextResult } from "ai";
import { openai } from "@ai-sdk/openai";
import { philosophers, debatePromptTemplate } from "./philosophers";
import type { Message, DebateEvent, Philosopher } from "./types";
import { generateId } from "ai";

export interface DebateConfig {
  topic: string;
  selectedPhilosophers: Philosopher[];
  maxRounds?: number;
  maxTokensPerMessage?: number;
}

export async function runDebate(
  config: DebateConfig,
  onEvent: (event: DebateEvent) => void
): Promise<void> {
  const { topic, selectedPhilosophers, maxRounds = 3 } = config;
  const conversationHistory: Message[] = [];

  onEvent({
    type: "message",
    message: {
      id: generateId(),
      philosopherId: "system",
      speaker: "Sistema",
      avatar: "🎭",
      content: `¡Bienvenidos al debate sobre: "${topic}"!`,
      timestamp: Date.now(),
    },
  });

  // Initial round: all philosophers give their opening statements
  onEvent({ type: "message", message: {
    id: generateId(),
    philosopherId: "system",
    speaker: "Sistema",
    avatar: "🎭",
    content: `Ronda 1: Declaraciones de apertura`,
    timestamp: Date.now(),
  }});

  // Each philosopher gives opening statement (parallel)
  const openingPrompts = selectedPhilosophers.map(p => ({
    philosopher: p,
    prompt: `${p.systemPrompt}\n\nEl tema del debate es: "${topic}".\n\nDa tu apertura. Máximo 100 palabras. Habla desde tu perspectiva única.`
  }));

  // Send "thinking" events
  selectedPhilosophers.forEach(p => onEvent({ type: "thinking", philosopherId: p.id }));

  // Run all openings in parallel
  const openingResults = await Promise.all(
    openingPrompts.map(async ({ philosopher, prompt }) => {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 200,
        system: "Sé breve, provocador y en tu personaje.",
      });
      return { philosopher, result };
    })
  );

  // Add opening statements to history
  openingResults.forEach(({ philosopher, result }) => {
    const message: Message = {
      id: generateId(),
      philosopherId: philosopher.id,
      speaker: philosopher.name,
      avatar: philosopher.avatar,
      content: result.text,
      timestamp: Date.now(),
    };
    conversationHistory.push(message);
    onEvent({ type: "message", message });
  });

  // Subsequent rounds: debate based on previous statements
  for (let round = 2; round <= maxRounds; round++) {
    onEvent({ type: "round_complete", round: round - 1 });
    onEvent({ type: "message", message: {
      id: generateId(),
      philosopherId: "system",
      speaker: "Sistema",
      avatar: "🎭",
      content: `Ronda ${round}: El debate continúa`,
      timestamp: Date.now(),
    }});

    // Sequential debate: each philosopher responds to the previous statements
    for (const philosopher of selectedPhilosophers) {
      onEvent({ type: "thinking", philosopherId: philosopher.id });

      const debatePrompt = `${philosophers.find(p => p.id === philosopher.id)?.systemPrompt}

Debate actual: ${topic}

Lo que se ha dicho hasta ahora:
${conversationHistory.map(m => `**${m.speaker}**: ${m.content}`).join('\n\n')}

Responde al debate. Máximo 120 palabras.`;
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: debatePrompt,
        maxTokens: 250,
      });

      const message: Message = {
        id: generateId(),
        philosopherId: philosopher.id,
        speaker: philosopher.name,
        avatar: philosopher.avatar,
        content: result.text,
        timestamp: Date.now(),
      };

      conversationHistory.push(message);
      onEvent({ type: "message", message });
    }
  }

  // Final summary
  onEvent({ type: "debate_complete", summary: `El debate sobre "${topic}" ha terminado después de ${maxRounds} rondas.` });
}

export async function streamDebate(
  config: DebateConfig
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: DebateEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runDebate(config, sendEvent);
      } catch (error) {
        sendEvent({ type: "error", error: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}