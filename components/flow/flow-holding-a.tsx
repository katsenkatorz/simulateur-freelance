import { FlowNode } from "./flow-node";
import { FlowEdge } from "./flow-edge";
import { vL, elbow } from "./helpers";
import { fmt, isLabel } from "@/lib/engine";
import type { Sim } from "@/lib/types";
import "./flow-styles.css";

export function FlowHoldingA({ sim }: { sim: Sim }) {
  const W = 500, bw = 155, cx = W / 2, rx = W - 30 - bw;

  return (
    <svg viewBox={`0 0 ${W} 620`} width="100%" className="block mx-auto max-w-[500px]">
      <FlowNode x={cx - 70} y={10} w={140} h={45} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
      <FlowEdge path={vL(cx, 55, 75)} color="#c084fc" label="CA" lx={cx + 8} ly={67} />
      <FlowNode x={cx - 85} y={75} w={170} h={50} color="#c084fc" label="🏛️ SASU" amount={sim.ca} sub="opérationnelle" delay={0.05} />
      <FlowEdge path={elbow(cx + 30, 125, rx + bw / 2, 165)} color="#ffa94d" label={"résultat " + fmt(sim.resultSASU)} lx={rx} ly={148} />
      <FlowNode x={rx} y={165} w={bw} h={48} color="#ffa94d" label="🏛️ IS SASU" amount={sim.isSASU.total} sub={isLabel(sim.isSASU)} delay={0.1} />
      <FlowEdge path={vL(rx + bw / 2, 213, 235)} color="#34d399" />
      <FlowNode x={rx} y={235} w={bw} h={50} color="#34d399" label="📊 Dividendes" amount={sim.divBrut} sub="95% exonéré IS" delay={0.15} />
      <FlowEdge path={`M${cx - 30},125 L${cx - 30},155 L${cx - 60},155 L${cx - 60},345`} color="#fbbf24" label={"mandat " + fmt(sim.mandatAn)} lx={20} ly={240} />
      <FlowEdge path={elbow(rx + bw / 2, 285, cx + 40, 345)} color="#34d399" label={"mère-fille " + fmt(sim.divBrut)} lx={cx + 50} ly={318} />
      <FlowNode x={cx - bw / 2} y={345} w={bw} h={55} color="#fbbf24" label="🏢 Holding" amount={sim.dispo} sub="cash: mandat + div. - charges" delay={0.2} />
      <FlowEdge path={vL(cx, 400, 430)} color="#ff6b6b" label="salaire gérant" lx={cx + 8} ly={418} />
      <FlowNode x={cx - bw / 2} y={430} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF TNS" amount={sim.co} sub="~43%" delay={0.25} />
      <FlowEdge path={vL(cx, 478, 505)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={cx + 8} ly={494} />
      <FlowNode x={cx - bw / 2} y={505} w={bw} h={55} color="#fbbf24" label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.3} />
    </svg>
  );
}
