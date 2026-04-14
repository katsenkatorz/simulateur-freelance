"use client"

import { fmt } from "@/lib/utils"
import { ArrowDown, ArrowRight, Building2, Landmark, Wallet, Banknote, Shield } from "lucide-react"

interface HoldingFlowProps {
  sim: {
    ca: number
    mandatAn: number
    resultSASU: number
    isSASU: { total: number; is15: number; is25: number }
    divBrut: number
    qp: number
    dispo: number
    net: number
    ir: number
    co: number
    ret?: number
    sasuL: { l: string; a: number; t: string }[]
    holdL: { l: string; a: number; t: string }[]
  }
}

function FlowNode({ icon: Icon, label, amount, color, sub }: {
  icon: typeof Building2; label: string; amount: number; color: string; sub?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-card border rounded-lg" style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        <Icon size={14} style={{ color }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-text-secondary truncate">{label}</div>
        {sub && <div className="text-[10px] text-text-tertiary">{sub}</div>}
      </div>
      <div className="font-mono text-sm font-bold shrink-0" style={{ color }}>{fmt(amount)}</div>
    </div>
  )
}

function FlowArrow({ direction = "down", color = "var(--color-text-tertiary)" }: { direction?: "down" | "right"; color?: string }) {
  const Icon = direction === "right" ? ArrowRight : ArrowDown
  return (
    <div className={direction === "right" ? "flex items-center justify-center px-1" : "flex justify-center py-1"}>
      <Icon size={14} style={{ color }} className="opacity-50" />
    </div>
  )
}

export function HoldingFlow({ sim }: HoldingFlowProps) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-3 text-center">
        Flux SASU + Holding
      </div>

      {/* SASU opérationnelle */}
      <FlowNode icon={Banknote} label="CA entrant (SASU)" amount={sim.ca} color="var(--color-accent)" />
      <FlowArrow color="var(--color-accent)" />

      {/* Bifurcation: mandat + résultat */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FlowNode icon={Wallet} label="Mandat président" amount={sim.mandatAn} color="var(--color-tax)" sub="Rémunération dirigeant" />
          <FlowArrow color="var(--color-tax)" />
          <FlowNode icon={Landmark} label="Cotisations TNS" amount={sim.co} color="var(--color-negative)" sub="~43% du mandat" />
        </div>
        <div>
          <FlowNode icon={Building2} label="Résultat SASU" amount={sim.resultSASU} color="var(--color-sasu)" sub="Après charges" />
          <FlowArrow color="var(--color-sasu)" />
          <FlowNode icon={Landmark} label="IS SASU" amount={sim.isSASU.total} color="var(--color-negative)" sub={sim.isSASU.is25 > 0 ? "15% + 25%" : "15%"} />
        </div>
      </div>

      {/* Dividendes */}
      <FlowArrow color="var(--color-holding)" />
      <FlowNode icon={ArrowRight} label="Dividendes inter-sociétés" amount={sim.divBrut} color="var(--color-holding)" sub="Remontée vers holding" />

      {/* Mère-fille */}
      <div className="mx-4 p-2.5 bg-positive/5 border border-positive/20 rounded-lg text-center">
        <div className="text-[10px] text-positive font-medium">Régime mère-fille</div>
        <div className="text-[10px] text-text-tertiary mt-0.5">
          95% exonéré d'IS · Quote-part 5% = {fmt(sim.qp)}
        </div>
      </div>

      {/* Holding */}
      <FlowArrow color="var(--color-holding)" />
      <FlowNode icon={Shield} label="Cash disponible Holding" amount={sim.dispo} color="var(--color-holding)" sub="Mandat + dividendes − charges" />

      {/* Sortie */}
      <FlowArrow color="var(--color-positive)" />
      <div className="flex items-center gap-3 p-4 rounded-xl border border-positive/30 bg-gradient-to-r from-positive/[0.06] to-transparent"
        style={{ boxShadow: "0 0 30px rgba(34,197,94,0.05)" }}>
        <Wallet size={18} className="text-positive shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <div className="text-xs text-positive/70">Net en poche</div>
          <div className="font-mono text-lg font-bold text-positive">{fmt(sim.net)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-text-tertiary">IR : {fmt(sim.ir)}</div>
          {sim.ret && sim.ret > 0 && <div className="text-[10px] text-positive">Capital : {fmt(sim.ret)}</div>}
        </div>
      </div>
    </div>
  )
}
