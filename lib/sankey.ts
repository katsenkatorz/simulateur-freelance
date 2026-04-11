import type { Sim } from "./types";
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
  const divBrut = sim.divBrut || 0;
  const mandatAn = sim.mandatAn || 0;
  const chHolding = CHARGES_FIXES_HOLDING;

  if (!isB) {
    // Holding mode A — tout en salaire via Holding
    return {
      nodes: [
        { id: "CA", color: C.neutral },
        { id: "Charges SASU", color: C.negative },
        { id: "IS SASU", color: C.tax },
        { id: "Mandat", color: C.neutral },
        { id: "Dividendes", color: C.positive },
        { id: "Charges Holding", color: C.negative },
        { id: "Cotisations TNS", color: C.negative },
        { id: "IR", color: C.tax },
        { id: "Net", color: C.primary },
      ],
      links: [
        { source: "CA", target: "Charges SASU", value: v(CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
        { source: "CA", target: "Mandat", value: v(mandatAn), startColor: C.neutral + "30", endColor: C.neutral },
        { source: "CA", target: "IS SASU", value: v(isSASU), startColor: C.tax + "30", endColor: C.tax },
        { source: "CA", target: "Dividendes", value: v(divBrut), startColor: C.positive + "30", endColor: C.positive },
        { source: "Mandat", target: "Charges Holding", value: v(chHolding), startColor: C.negative + "30", endColor: C.negative },
        { source: "Mandat", target: "Cotisations TNS", value: v(sim.co), startColor: C.negative + "30", endColor: C.negative },
        { source: "Dividendes", target: "Cotisations TNS", value: v(Math.max(0, (sim.dispo || 0) - mandatAn - sim.co - chHolding + sim.co)), startColor: C.negative + "20", endColor: C.negative },
        { source: "Mandat", target: "IR", value: v(sim.ir), startColor: C.tax + "30", endColor: C.tax },
        { source: "Dividendes", target: "Net", value: v(sim.net), startColor: C.primary + "30", endColor: C.primary },
      ],
    };
  }

  // Holding mode B — salaire + capitalisation
  const isHolding = sim.is || 0;
  const ret = sim.ret || 0;

  return {
    nodes: [
      { id: "CA", color: C.neutral },
      { id: "Charges SASU", color: C.negative },
      { id: "IS SASU", color: C.tax },
      { id: "Mandat", color: C.neutral },
      { id: "Dividendes", color: C.positive },
      { id: "Charges Holding", color: C.negative },
      { id: "Cotisations TNS", color: C.negative },
      { id: "IR perso", color: C.tax },
      { id: "IS Holding", color: C.tax },
      { id: "Net perso", color: C.primary },
      { id: "Capital Holding", color: C.positive },
    ],
    links: [
      { source: "CA", target: "Charges SASU", value: v(CHARGES_FIXES_SOCIETE), startColor: C.negative + "30", endColor: C.negative },
      { source: "CA", target: "Mandat", value: v(mandatAn), startColor: C.neutral + "30", endColor: C.neutral },
      { source: "CA", target: "IS SASU", value: v(isSASU), startColor: C.tax + "30", endColor: C.tax },
      { source: "CA", target: "Dividendes", value: v(divBrut), startColor: C.positive + "30", endColor: C.positive },
      { source: "Mandat", target: "Charges Holding", value: v(chHolding), startColor: C.negative + "30", endColor: C.negative },
      { source: "Mandat", target: "Cotisations TNS", value: v(sim.co), startColor: C.negative + "30", endColor: C.negative },
      { source: "Mandat", target: "IR perso", value: v(sim.ir), startColor: C.tax + "30", endColor: C.tax },
      { source: "Dividendes", target: "Net perso", value: v(sim.net), startColor: C.primary + "30", endColor: C.primary },
      { source: "Dividendes", target: "IS Holding", value: v(isHolding), startColor: C.tax + "30", endColor: C.tax },
      { source: "Dividendes", target: "Capital Holding", value: v(ret), startColor: C.positive + "30", endColor: C.positive },
    ],
  };
}
