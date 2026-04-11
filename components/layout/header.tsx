"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";
import { ChevronDown, Check } from "lucide-react";
import type { StructConfig } from "@/lib/types";
import type { ElementType } from "react";

interface HeaderProps {
  structs: StructConfig[];
  sel: string;
  onSelect: (id: string) => void;
  getData: (id: string) => { net: number; ret: number; dCA: number };
  icons: Record<string, ElementType>;
}

export function Header({ structs, sel, onSelect, getData, icons }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = structs.find(s => s.id === sel);
  const CurrentIcon = icons[sel];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-14 border-b border-border-subtle bg-bg-card flex items-center px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-text-tertiary font-medium">Simulateur</span>
        <ChevronDown size={14} className="text-text-tertiary -rotate-90" />

        {/* Switcher */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-default bg-bg-primary transition-colors cursor-pointer"
          >
            {CurrentIcon && <CurrentIcon size={14} className="text-text-secondary" />}
            <span className="font-semibold text-text-primary">{current?.name}</span>
            <ChevronDown size={14} className={cn("text-text-tertiary transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-bg-card border border-border-default rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              {structs.map(st => {
                const d = getData(st.id);
                const Icon = icons[st.id];
                const isActive = sel === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => { onSelect(st.id); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
                      isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
                    )}
                  >
                    {Icon && <Icon size={16} className={isActive ? "text-text-primary" : "text-text-tertiary"} />}
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium", isActive ? "text-text-primary" : "text-text-secondary")}>
                        {st.name}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-text-tertiary">{fmt(d.net)}</span>
                    {isActive && <Check size={14} className="text-text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-xs text-text-tertiary hidden md:block">Barème 2026</span>
      </div>
    </header>
  );
}
