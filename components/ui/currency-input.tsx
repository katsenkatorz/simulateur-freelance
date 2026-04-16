"use client";

import { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const PRESETS = [30_000, 50_000, 100_000, 200_000, 500_000];

function formatDisplay(n: number): string {
  return n.toLocaleString("fr-FR");
}

function parseInput(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}

interface CurrencyInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function CurrencyInput({ value, onChange, min = 0, max = 1_000_000, label }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInput(e.target.value);
    const clamped = Math.min(Math.max(parsed, min), max);
    onChange(clamped);
  }, [onChange, min, max]);

  const handlePreset = useCallback((preset: number) => {
    onChange(Math.min(Math.max(preset, min), max));
  }, [onChange, min, max]);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          aria-label={!label ? "Montant en euros" : undefined}
          value={formatDisplay(value)}
          onChange={handleChange}
          className={cn(
            "w-full bg-bg-primary border border-border-default rounded-lg",
            "px-4 py-3 text-right text-2xl font-bold font-mono text-text-primary",
            "focus:outline-none focus:ring-1 focus:ring-text-primary/30 focus:border-text-primary/30",
            "transition-all duration-200"
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-lg pointer-events-none">
          €
        </span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            aria-label={`${p.toLocaleString("fr-FR")} euros`}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              "border",
              value === p
                ? "bg-text-primary text-bg-primary border-text-primary"
                : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default hover:text-text-secondary"
            )}
          >
            {p >= 1000 ? Math.round(p / 1000) + "k" : p}
          </button>
        ))}
      </div>
    </div>
  );
}
