"use client"

import { fmt } from "@/lib/utils"

export interface DetailRow {
  label: string
  amount: number
  description?: string
}

export interface CascadeDetailProps {
  rows: DetailRow[]
}

export function CascadeDetail({ rows }: CascadeDetailProps) {
  if (rows.length === 0) return null

  return (
    <div className="border-t border-border-subtle pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded"
          >
            <div className="min-w-0">
              <div className="text-xs text-text-secondary truncate">{row.label}</div>
              {row.description && (
                <div className="text-[11px] text-text-tertiary mt-0.5 leading-snug">{row.description}</div>
              )}
            </div>
            <div className="font-mono font-medium text-xs text-text-primary ml-3 shrink-0">
              {fmt(row.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
