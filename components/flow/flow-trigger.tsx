"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Search } from "lucide-react"

const PedagogicalFlow = dynamic(
  () => import("@/components/detail/flow-tab").then(m => ({ default: m.FlowTab })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-bg-elevated rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-text-tertiary text-sm">Chargement du schéma...</span>
      </div>
    ),
  }
)

interface FlowTriggerProps {
  showFlow: boolean
  // Pass-through props for FlowTab
  sel: string
  sim: unknown
  isB: boolean
  accent: string
  regEI: string
  regEURL: string
  regSASU: string
  eiCanB: boolean
  eurlCanB: boolean
  sasuCanB: boolean
}

export function FlowTrigger({ showFlow, sel, sim, isB, accent, regEI, regEURL, regSASU, eiCanB, eurlCanB, sasuCanB }: FlowTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!showFlow) return null

  if (open) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          ← Retour à la cascade
        </button>
        <PedagogicalFlow
          sel={sel}
          sim={sim as never}
          isB={isB}
          accent={accent}
          regEI={regEI}
          regEURL={regEURL}
          regSASU={regSASU}
          eiCanB={eiCanB}
          eurlCanB={eurlCanB}
          sasuCanB={sasuCanB}
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="w-full border border-dashed border-border-subtle rounded-lg p-4 hover:border-accent transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-center gap-2 text-accent">
        <Search size={16} />
        <span className="text-sm font-medium">Comprendre la mécanique</span>
      </div>
      <p className="text-xs text-text-tertiary mt-1">
        Voir comment l'argent circule dans la structure
      </p>
    </button>
  )
}
