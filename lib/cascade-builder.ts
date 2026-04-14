// Cascade builder receives any Sim variant and accesses properties
// that may not exist on all variants. Using any for flexibility.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimAny = any
import type { CascadeItem } from "@/components/cascade"
import type { DetailRow } from "@/components/cascade/cascade-detail"
import type { CotisItem } from "./types"
import {
  ArrowDownCircle, Receipt, Percent, Wallet, Building2,
  Heart, Briefcase, HandCoins, Landmark,
} from "lucide-react"

/**
 * Transform a Sim result into CascadeItem[] for CascadeFlow rendering.
 * Each item represents a step in the money flow: CA → deductions → NET.
 */
export function buildCascadeItems(
  sim: SimAny,
  cotisItems: CotisItem[],
  ca: number,
): CascadeItem[] {
  const items: CascadeItem[] = []

  // 1. CA entry
  items.push({
    icon: ArrowDownCircle,
    label: "Chiffre d'affaires",
    sublabel: "Revenu brut annuel",
    amount: ca,
    percentage: 100,
    type: "ca",
    detail: [],
  })

  // 2. Cotisations sociales
  const coDetail: DetailRow[] = cotisItems.map(ci => ({
    label: ci.n.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]/gu, "").trim(),
    amount: ci.a,
    description: ci.c === "✅" ? "Couvert" : ci.c === "✅✅" ? "Excellente couverture" : ci.c === "⚠️" ? "Couverture partielle" : ci.c === "❌" ? "Non couvert" : undefined,
  }))

  items.push({
    icon: Heart,
    label: "Cotisations sociales",
    sublabel: cotisLabel(sim),
    amount: -sim.co,
    percentage: ca > 0 ? (sim.co / ca) * 100 : 0,
    type: "charge",
    detail: coDetail,
  })

  // 3. IR
  if (sim.ir > 0) {
    items.push({
      icon: Landmark,
      label: "Impôt sur le revenu",
      sublabel: "Barème progressif 2026",
      amount: -sim.ir,
      percentage: ca > 0 ? (sim.ir / ca) * 100 : 0,
      type: "tax",
      detail: [],
    })
  }

  // 4. IS (if Mode B / capitalization)
  const isTotal = sim.isD?.total || sim.is || 0
  if (isTotal > 0) {
    const isDetail: DetailRow[] = []
    if (sim.isD) {
      if (sim.isD.is15 > 0) isDetail.push({ label: "IS 15%", amount: sim.isD.is15, description: "Taux réduit PME" })
      if (sim.isD.is25 > 0) isDetail.push({ label: "IS 25%", amount: sim.isD.is25, description: "Taux normal" })
    }
    items.push({
      icon: Building2,
      label: "Impôt sur les sociétés",
      amount: -isTotal,
      percentage: ca > 0 ? (isTotal / ca) * 100 : 0,
      type: "tax",
      detail: isDetail,
    })
  }

  // 5. Capital retained (if Mode B)
  if (sim.ret && sim.ret > 0) {
    items.push({
      icon: Briefcase,
      label: "Capitalisé dans la société",
      sublabel: "Disponible pour investissement ou dividendes",
      amount: sim.ret,
      percentage: ca > 0 ? (sim.ret / ca) * 100 : 0,
      type: "ca",
      detail: [],
    })
  }

  // 6. NET en poche
  items.push({
    icon: Wallet,
    label: "Ce qui arrive sur votre compte",
    sublabel: "Après toutes les cotisations et impôts",
    amount: sim.net,
    percentage: ca > 0 ? (sim.net / ca) * 100 : 0,
    type: "net",
    detail: [
      { label: "Net mensuel", amount: Math.round(sim.net / 12), description: "Disponible sur votre compte" },
    ],
  })

  return items
}

function cotisLabel(sim: SimAny): string {
  switch (sim.kind) {
    case "micro": return "URSSAF micro BNC (25,6%)"
    case "tns_a":
    case "tns_b": return "URSSAF TNS (~43%)"
    case "sasu_a":
    case "sasu_b": return "Patronales + salariales (~77%)"
    case "holding_a":
    case "holding_b": return "URSSAF TNS (~43%)"
    default: return "Cotisations sociales"
  }
}
