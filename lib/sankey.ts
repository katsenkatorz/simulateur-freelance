import type { Sim } from "./types";
import { CHARGES_FIXES_SOCIETE } from "./fiscal";

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

export function simToSankey(sim: Sim, type: string, isB: boolean): SankeyData {
  if (type === "micro") {
    return {
      nodes: [
        { id: "CA", color: "#a1a1aa" },
        { id: "URSSAF", color: "#f43f5e" },
        { id: "IR", color: "#f59e0b" },
        { id: "Net", color: "#60a5fa" },
      ],
      links: [
        { source: "CA", target: "URSSAF", value: sim.co, startColor: "#f43f5e44", endColor: "#f43f5e" },
        { source: "CA", target: "IR", value: sim.ir, startColor: "#f59e0b44", endColor: "#f59e0b" },
        { source: "CA", target: "Net", value: Math.max(1, sim.net), startColor: "#60a5fa44", endColor: "#60a5fa" },
      ],
    };
  }

  if (!isB) {
    // Mode A — tout en salaire
    const charges = CHARGES_FIXES_SOCIETE;
    const urssaf = sim.co - charges;
    return {
      nodes: [
        { id: "CA", color: "#a1a1aa" },
        { id: "Charges", color: "#f43f5e" },
        { id: "URSSAF", color: "#f43f5e" },
        { id: "IR", color: "#f59e0b" },
        { id: "Net", color: "#22c55e" },
      ],
      links: [
        { source: "CA", target: "Charges", value: charges, startColor: "#f43f5e44", endColor: "#f43f5e" },
        { source: "CA", target: "URSSAF", value: urssaf, startColor: "#f43f5e44", endColor: "#f43f5e" },
        { source: "CA", target: "IR", value: sim.ir, startColor: "#f59e0b44", endColor: "#f59e0b" },
        { source: "CA", target: "Net", value: Math.max(1, sim.net), startColor: "#22c55e44", endColor: "#22c55e" },
      ],
    };
  }

  // Mode B — capitalisation
  const charges = CHARGES_FIXES_SOCIETE;
  const cotis = sim.cotisOnly || sim.co - charges;
  const is = sim.is || 0;
  const ret = sim.ret || 0;

  return {
    nodes: [
      { id: "CA", color: "#a1a1aa" },
      { id: "Charges", color: "#f43f5e" },
      { id: "URSSAF", color: "#f43f5e" },
      { id: "IR", color: "#f59e0b" },
      { id: "IS", color: "#f59e0b" },
      { id: "Net perso", color: "#22c55e" },
      { id: "Capital", color: "#22c55e" },
    ],
    links: [
      { source: "CA", target: "Charges", value: charges, startColor: "#f43f5e44", endColor: "#f43f5e" },
      { source: "CA", target: "URSSAF", value: Math.max(1, cotis), startColor: "#f43f5e44", endColor: "#f43f5e" },
      { source: "CA", target: "IR", value: Math.max(1, sim.ir), startColor: "#f59e0b44", endColor: "#f59e0b" },
      { source: "CA", target: "IS", value: Math.max(1, is), startColor: "#f59e0b44", endColor: "#f59e0b" },
      { source: "CA", target: "Net perso", value: Math.max(1, sim.net), startColor: "#22c55e44", endColor: "#22c55e" },
      { source: "CA", target: "Capital", value: Math.max(1, ret), startColor: "#22c55e44", endColor: "#22c55e" },
    ],
  };
}
