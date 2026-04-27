"use client";

import type { Philosopher } from "@/lib/agents/types";

interface TopicInputProps {
  philosophers: Philosopher[];
  selectedPhilosophers: Philosopher[];
  onToggle: (philosopher: Philosopher) => void;
  onStart: () => void;
  isStarting: boolean;
}

export default function TopicInput({
  philosophers,
  selectedPhilosophers,
  onToggle,
  onStart,
  isStarting,
}: TopicInputProps) {
  const selectedIds = new Set(selectedPhilosophers.map((p) => p.id));

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 text-center">
          <span className="text-amber-500">The</span> Afterlife Forum
        </h1>
        <p className="text-xl text-zinc-400 mb-12 text-center max-w-2xl">
         dead philosophers still debating
        </p>

        {/* Topic Input */}
        <div className="w-full max-w-2xl mb-12">
          <label className="block text-sm text-zinc-500 mb-2 uppercase tracking-wider">
            Topic
          </label>
          <input
            type="text"
            placeholder="¿El amor es más poderoso que el dinero?"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>

        {/* Philosopher Selection */}
        <div className="w-full max-w-4xl mb-12">
          <h2 className="text-sm text-zinc-500 mb-4 uppercase tracking-wider text-center">
            Selecciona 2-5 filósofos ({selectedPhilosophers.length} seleccionados)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {philosophers.map((philosopher) => {
              const isSelected = selectedIds.has(philosopher.id);
              return (
                <button
                  key={philosopher.id}
                  onClick={() => onToggle(philosopher)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      isSelected
                        ? `${philosopher.borderColor} ${philosopher.color} border-opacity-50`
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{philosopher.avatar}</div>
                  <div className="font-semibold text-white text-sm">
                    {philosopher.name}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {philosopher.title}
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-xs text-white font-bold">
                      ✓ Seleccionado
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          disabled={isStarting || selectedPhilosophers.length < 2}
          className={`
            px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200
            ${
              selectedPhilosophers.length >= 2 && !isStarting
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }
          `}
        >
          {isStarting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Iniciando Debate...
            </span>
          ) : (
            "🎭 Iniciar Debate"
          )}
        </button>
      </div>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}