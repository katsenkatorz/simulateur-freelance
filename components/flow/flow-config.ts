import type { Node, Edge } from "@xyflow/react";
import { Position } from "@xyflow/react";
// TODO: Remove `any` cast after Epic 8 rebuilds flow with proper narrowing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sim = any;
import { fmt, isLabel } from "@/lib/engine";
import { CHARGES_FIXES_SOCIETE } from "@/lib/fiscal";

type FNode = Node<{ label: string; amount: number; sub?: string; color: string; icon?: string }, "flowNode">;
type FEdge = Edge<{ label?: string; color: string }, "flowEdge">;

const CX = 300; // center X
const COL_L = 60; // left column X
const COL_R = 540; // right column X
const ROW_H = 110; // row height

function n(id: string, x: number, y: number, label: string, amount: number, color: string, sub?: string, icon?: string): FNode {
  return {
    id,
    type: "flowNode",
    position: { x, y },
    data: { label, amount, color, sub, icon },
    draggable: false,
    selectable: false,
  };
}

function e(id: string, source: string, target: string, color: string, label?: string): FEdge {
  return {
    id,
    type: "flowEdge",
    source,
    target,
    data: { color, label },
    animated: false,
  };
}

export function buildFlowSimple(sim: Sim, accent: string, icon: string, name: string, chargeLabel: string): { nodes: FNode[]; edges: FEdge[] } {
  return {
    nodes: [
      n("client", CX, 0, "Client", sim.ca, "#71717a", undefined, undefined),
      n("entity", CX, ROW_H, name, sim.ca, accent, undefined, icon),
      n("urssaf", CX, ROW_H * 2, "URSSAF", sim.co, "#f43f5e", chargeLabel, undefined),
      n("you", CX, ROW_H * 3, "Vous", sim.net, accent, fmt(Math.round(sim.net / 12)) + "/mois", undefined),
    ],
    edges: [
      e("e1", "client", "entity", accent, "CA"),
      e("e2", "entity", "urssaf", "#f43f5e", chargeLabel),
      e("e3", "urssaf", "you", "#f59e0b", "IR " + fmt(sim.ir)),
    ],
  };
}

export function buildFlowSplit(sim: Sim, accent: string, icon: string, name: string, capSub: string): { nodes: FNode[]; edges: FEdge[] } {
  return {
    nodes: [
      n("client", CX, 0, "Client", sim.ca, "#71717a", undefined, undefined),
      n("entity", CX, ROW_H, name, sim.ca - CHARGES_FIXES_SOCIETE, accent, "après charges", icon),
      n("urssaf", COL_L, ROW_H * 2.2, "URSSAF", sim.cotisOnly || sim.co - CHARGES_FIXES_SOCIETE, "#f43f5e", undefined, undefined),
      n("you", COL_L, ROW_H * 3.2, "Vous", sim.net, accent, fmt(Math.round(sim.net / 12)) + "/mois", undefined),
      n("is", COL_R, ROW_H * 2.2, "IS", sim.is || 0, "#f59e0b", sim.isD ? isLabel(sim.isD) : undefined, undefined),
      n("capital", COL_R, ROW_H * 3.2, "Capital", sim.ret, "#22c55e", capSub, undefined),
    ],
    edges: [
      e("e1", "client", "entity", accent),
      e("e2", "entity", "urssaf", accent, "salaire"),
      e("e3", "entity", "is", "#f59e0b", "bénéfice"),
      e("e4", "urssaf", "you", "#f59e0b", "IR " + fmt(sim.ir)),
      e("e5", "is", "capital", "#22c55e"),
    ],
  };
}

export function buildFlowHoldingA(sim: Sim): { nodes: FNode[]; edges: FEdge[] } {
  return {
    nodes: [
      n("client", CX, 0, "Client", sim.ca, "#71717a", undefined, undefined),
      n("sasu", CX, ROW_H, "SASU", sim.ca, "#a78bfa", "opérationnelle", undefined),
      n("is_sasu", COL_R, ROW_H * 2, "IS SASU", sim.isSASU.total, "#f59e0b", isLabel(sim.isSASU), undefined),
      n("dividendes", COL_R, ROW_H * 3, "Dividendes", sim.divBrut, "#22c55e", "95% exonéré IS", undefined),
      n("holding", CX, ROW_H * 4, "Holding", sim.dispo, "#fbbf24", "mandat + div.", undefined),
      n("urssaf", CX, ROW_H * 5, "URSSAF TNS", sim.co, "#f43f5e", "~43%", undefined),
      n("you", CX, ROW_H * 6, "Vous", sim.net, "#fbbf24", fmt(Math.round(sim.net / 12)) + "/mois", undefined),
    ],
    edges: [
      e("e1", "client", "sasu", "#a78bfa", "CA"),
      e("e2", "sasu", "is_sasu", "#f59e0b", "résultat"),
      e("e3", "is_sasu", "dividendes", "#22c55e"),
      e("e4", "sasu", "holding", "#fbbf24", "mandat " + fmt(sim.mandatAn)),
      e("e5", "dividendes", "holding", "#22c55e", "mère-fille"),
      e("e6", "holding", "urssaf", "#f43f5e", "salaire"),
      e("e7", "urssaf", "you", "#f59e0b", "IR " + fmt(sim.ir)),
    ],
  };
}

export function buildFlowHoldingB(sim: Sim): { nodes: FNode[]; edges: FEdge[] } {
  return {
    nodes: [
      n("client", CX, 0, "Client", sim.ca, "#71717a", undefined, undefined),
      n("sasu", CX, ROW_H, "SASU", sim.ca, "#a78bfa", "opérationnelle", undefined),
      n("is_sasu", COL_R, ROW_H * 2, "IS SASU", sim.isSASU.total, "#f59e0b", isLabel(sim.isSASU), undefined),
      n("dividendes", COL_R, ROW_H * 3, "Dividendes", sim.divBrut, "#22c55e", "95% exonéré", undefined),
      n("holding", CX, ROW_H * 4, "Holding", sim.dispo, "#fbbf24", "mandat + div.", undefined),
      n("urssaf", COL_L, ROW_H * 5.2, "URSSAF TNS", sim.co, "#f43f5e", "~43%", undefined),
      n("you", COL_L, ROW_H * 6.2, "Vous", sim.net, "#fbbf24", fmt(Math.round(sim.net / 12)) + "/mois", undefined),
      n("is_hold", COL_R, ROW_H * 5.2, "IS Holding", sim.is || 0, "#f59e0b", sim.isH ? isLabel(sim.isH) : undefined, undefined),
      n("capital", COL_R, ROW_H * 6.2, "Capital", sim.ret, "#22c55e", "Bourse · SCI · Lombard", undefined),
    ],
    edges: [
      e("e1", "client", "sasu", "#a78bfa"),
      e("e2", "sasu", "is_sasu", "#f59e0b", "résultat"),
      e("e3", "is_sasu", "dividendes", "#22c55e"),
      e("e4", "sasu", "holding", "#fbbf24", "mandat"),
      e("e5", "dividendes", "holding", "#22c55e", "mère-fille"),
      e("e6", "holding", "urssaf", "#fbbf24", "salaire " + fmt(sim.nr)),
      e("e7", "holding", "is_hold", "#f59e0b", "imposable"),
      e("e8", "urssaf", "you", "#f59e0b", "IR " + fmt(sim.ir)),
      e("e9", "is_hold", "capital", "#22c55e"),
    ],
  };
}
