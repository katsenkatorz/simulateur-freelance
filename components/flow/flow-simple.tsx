import { FlowNode } from "./flow-node";
import { FlowEdge } from "./flow-edge";
import { vL } from "./helpers";
import { fmt } from "@/lib/engine";
import type { Sim } from "@/lib/types";
import "./flow-styles.css";

interface Props {
  sim: Sim;
  accent: string;
  icon: string;
  name: string;
  chargeLabel: string;
}

export function FlowSimple({ sim, accent, icon, name, chargeLabel }: Props) {
  const W = 380, bw = 155, cx = W / 2, g = 22, bh = 50;
  const y0 = 15, y1 = y0 + bh + g, y2 = y1 + bh + g, y3 = y2 + bh + g;

  return (
    <svg viewBox={`0 0 ${W} ${y3 + 55}`} width="100%" className="block mx-auto max-w-[380px]">
      <FlowNode x={cx - bw / 2} y={y0} w={bw} h={bh} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
      <FlowEdge path={vL(cx, y0 + bh, y1)} color={accent} label="CA" lx={cx + 8} ly={y0 + bh + g / 2 + 3} />
      <FlowNode x={cx - bw / 2} y={y1} w={bw} h={bh} color={accent} label={icon + " " + name} amount={sim.ca} delay={0.1} />
      <FlowEdge path={vL(cx, y1 + bh, y2)} color="#ff6b6b" label={"URSSAF " + chargeLabel} lx={cx + 8} ly={y1 + bh + g / 2 + 3} />
      <FlowNode x={cx - bw / 2} y={y2} w={bw} h={bh} color="#ff6b6b" label="📋 URSSAF" amount={sim.co} sub={chargeLabel} delay={0.2} />
      <FlowEdge path={vL(cx, y2 + bh, y3)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={cx + 8} ly={y2 + bh + g / 2 + 3} />
      <FlowNode x={cx - bw / 2} y={y3} w={bw} h={55} color={accent} label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.3} />
    </svg>
  );
}
