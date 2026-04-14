"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  className?: string;
  label?: string;
  valueText?: string;
  describedBy?: string;
}

export function RangeSlider({ min, max, step, value, onChange, className, label, valueText, describedBy }: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;

    const update = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      onChange(clamped);
    };

    update(e.clientX);

    const onMove = (ev: PointerEvent) => update(ev.clientX);
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [min, max, step, onChange]);

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText || String(value)}
      aria-describedby={describedBy}
      tabIndex={0}
      className={cn("relative h-8 flex items-center cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded", className)}
      onPointerDown={handlePointer}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault()
          onChange(Math.min(max, value + step))
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault()
          onChange(Math.max(min, value - step))
        } else if (e.key === "Home") {
          e.preventDefault()
          onChange(min)
        } else if (e.key === "End") {
          e.preventDefault()
          onChange(max)
        }
      }}
    >
      {/* Track background */}
      <div className="absolute left-0 right-0 h-1.5 rounded-full bg-border-strong" />
      {/* Track fill */}
      <div
        className="absolute left-0 h-1.5 rounded-full bg-text-tertiary"
        style={{ width: pct + "%" }}
      />
      {/* Thumb */}
      <div
        className="absolute w-4 h-4 rounded-full bg-text-primary border-2 border-border-strong -translate-x-1/2 hover:scale-110 transition-transform shadow-sm"
        style={{ left: pct + "%" }}
      />
    </div>
  );
}
