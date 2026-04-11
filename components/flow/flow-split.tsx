import { FlowNode } from "./flow-node";
import { FlowEdge } from "./flow-edge";
import { vL, elbow } from "./helpers";
import { fmt, isLabel } from "@/lib/engine";
import { CHARGES_FIXES_SOCIETE } from "@/lib/fiscal";
import type { Sim } from "@/lib/types";
import "./flow-styles.css";

interface Props {
  sim: Sim;
  accent: string;
  icon: string;
  name: string;
  capSub: string;
}

export function FlowSplit({ sim, accent, icon, name, capSub }: Props) {
  const W = 500, bw = 150, lx = 18, rx = W - 18 - bw;

  return (
    <svg viewBox={`0 0 ${W} 430`} width="100%" className="block mx-auto max-w-[500px]">
      <FlowNode x={W / 2 - 70} y={10} w={140} h={48} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
      <FlowEdge path={vL(W / 2, 58, 85)} color={accent} />
      <FlowNode x={W / 2 - 78} y={85} w={156} h={48} color={accent} label={icon + " " + name} amount={sim.ca - CHARGES_FIXES_SOCIETE} sub="après charges" delay={0.08} />
      <FlowEdge path={elbow(W / 2 - 20, 133, lx + bw / 2, 195)} color={accent} label="salaire" lx={lx + 5} ly={165} />
      <FlowEdge path={elbow(W / 2 + 20, 133, rx + bw / 2, 195)} color="#ffa94d" label="bénéfice" lx={rx + 5} ly={165} />
      <FlowNode x={lx} y={195} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF" amount={sim.cotisOnly || sim.co - CHARGES_FIXES_SOCIETE} delay={0.15} />
      <FlowEdge path={vL(lx + bw / 2, 243, 275)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={lx + bw / 2 + 8} ly={262} />
      <FlowNode x={lx} y={275} w={bw} h={55} color={accent} label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.2} />
      <FlowNode x={rx} y={195} w={bw} h={48} color="#ffa94d" label={"🏛️ " + (sim.isD ? isLabel(sim.isD) : "IS")} amount={sim.is || 0} delay={0.15} />
      <FlowEdge path={vL(rx + bw / 2, 243, 275)} color="#34d399" />
      <FlowNode x={rx} y={275} w={bw} h={55} color="#34d399" label="💰 Dans la société" amount={sim.ret} sub={capSub} delay={0.2} />
    </svg>
  );
}
