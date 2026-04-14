// TODO: Delete this file entirely in Story 2.1 (dead code)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sim = any;
import { CHARGES_FIXES_SOCIETE, CHARGES_FIXES_HOLDING } from "./fiscal";

interface SankeyNode {
  id: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  startColor?: string;
  endColor?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

const C = {
  neutral: "#71717a",
  negative: "#f43f5e",
  tax: "#f59e0b",
  positive: "#22c55e",
  primary: "#fafafa",
};

function v(n: number) { return Math.max(1, Math.round(n)); }

export function simToSankey(sim: Sim, type: string, isB: boolean): SankeyData {
  if (type === "micro") {
    return {
      nodes: [
        { id: "CA", color: C.neutral },
        { id: "URSSAF", color: C.negative },
        { id: "IR", color: C.tax },
        { id: "Net", color: C.primary },
      ],
      links: [
        { source: "CA", target: "URSSAF", value: v(sim.co), startColor: C.negative + "30", endColor: C.negative },
        { source: "CA", target: "IR", value: v(sim.ir), startColor: C.tax + "30", endColor: C.tax },
        { source: "CA", target: "Net", value: v(sim.net), startColor: C.primary + "30", endColor: C.primary },
      ],
    };
  }

  if (type === "holding") {
    return buildHoldingSankey(sim, isB);
  }

  if (!isB) {
    // Mode A — EI/EURL/SASU tout en salaire
    return {
      nodes: [
        { id: "CA", color: C.neutral },
        { id: "Charges fixes", color: C.negative },
        { id: "Cotisations", color: C.negative },
        { id: "IR", color: C.tax },
        { id: "Net", color: C.primary },
      ],
      links: [
        { source: "CA", target: "Charges fixes", value: v(CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
        { source: "CA", target: "Cotisations", value: v(sim.co - CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
        { source: "CA", target: "IR", value: v(sim.ir), startColor: C.tax + "30", endColor: C.tax },
        { source: "CA", target: "Net", value: v(sim.net), startColor: C.primary + "30", endColor: C.primary },
      ],
    };
  }

  // Mode B — EI/EURL/SASU capitalisation
  return {
    nodes: [
      { id: "CA", color: C.neutral },
      { id: "Charges fixes", color: C.negative },
      { id: "Cotisations", color: C.negative },
      { id: "IR perso", color: C.tax },
      { id: "IS société", color: C.tax },
      { id: "Net perso", color: C.primary },
      { id: "Capital", color: C.positive },
    ],
    links: [
      { source: "CA", target: "Charges fixes", value: v(CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
      { source: "CA", target: "Cotisations", value: v(sim.cotisOnly || sim.co - CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
      { source: "CA", target: "IR perso", value: v(sim.ir), startColor: C.tax + "30", endColor: C.tax },
      { source: "CA", target: "IS société", value: v(sim.is || 0), startColor: C.tax + "30", endColor: C.tax },
      { source: "CA", target: "Net perso", value: v(sim.net), startColor: C.primary + "30", endColor: C.primary },
      { source: "CA", target: "Capital", value: v(sim.ret || 0), startColor: C.positive + "30", endColor: C.positive },
    ],
  };
}

function buildHoldingSankey(sim: Sim, isB: boolean): SankeyData {
  const isSASU = sim.isSASU?.total || 0;
  const chHolding = CHARGES_FIXES_HOLDING;

  if (!isB) {
    // Holding mode A — flat view: CA → destinations finales
    return {
      nodes: [
        { id: "CA", color: C.neutral },
        { id: "Charges SASU", color: C.negative },
        { id: "Charges Holding", color: C.negative },
        { id: "IS SASU", color: C.tax },
        { id: "Cotisations TNS", color: C.negative },
        { id: "IR", color: C.tax },
        { id: "Net", color: C.primary },
      ],
      links: [
        { source: "CA", target: "Charges SASU", value: v(CHARGES_FIXES_SOCIETE) },
        { source: "CA", target: "Charges Holding", value: v(chHolding) },
        { source: "CA", target: "IS SASU", value: v(isSASU) },
        { source: "CA", target: "Cotisations TNS", value: v(sim.co) },
        { source: "CA", target: "IR", value: v(sim.ir) },
        { source: "CA", target: "Net", value: v(sim.net) },
      ],
    };
  }

  // Holding mode B — flat view: CA → destinations finales
  const isHolding = sim.is || 0;
  const ret = sim.ret || 0;

  return {
    nodes: [
      { id: "CA", color: C.neutral },
      { id: "Charges SASU", color: C.negative },
      { id: "Charges Holding", color: C.negative },
      { id: "IS SASU", color: C.tax },
      { id: "Cotisations TNS", color: C.negative },
      { id: "IR perso", color: C.tax },
      { id: "IS Holding", color: C.tax },
      { id: "Net perso", color: C.primary },
      { id: "Capital Holding", color: C.positive },
    ],
    links: [
      { source: "CA", target: "Charges SASU", value: v(CHARGES_FIXES_SOCIETE) },
      { source: "CA", target: "Charges Holding", value: v(chHolding) },
      { source: "CA", target: "IS SASU", value: v(isSASU) },
      { source: "CA", target: "Cotisations TNS", value: v(sim.co) },
      { source: "CA", target: "IR perso", value: v(sim.ir) },
      { source: "CA", target: "IS Holding", value: v(isHolding) },
      { source: "CA", target: "Net perso", value: v(sim.net) },
      { source: "CA", target: "Capital Holding", value: v(ret) },
    ],
  };
}
