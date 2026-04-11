import { FlowNode } from "./flow-node";
import { FlowEdge } from "./flow-edge";
import { vL, elbow } from "./helpers";
import { fmt, isLabel } from "@/lib/engine";
import type { Sim } from "@/lib/types";
import "./flow-styles.css";

export function FlowHoldingB({ sim }: { sim: Sim }) {
  const W = 520, bw = 155, cx = W / 2, lx = 15, rx = W - 15 - bw;

  return (
    <svg viewBox={`0 0 ${W} 700`} width="100%" className="block mx-auto max-w-[520px]">
      <FlowNode x={cx - 70} y={10} w={140} h={45} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
      <FlowEdge path={vL(cx, 55, 75)} color="#c084fc" />
      <FlowNode x={cx - 85} y={75} w={170} h={50} color="#c084fc" label="🏛️ SASU" amount={sim.ca} sub="opérationnelle" delay={0.05} />
      <FlowEdge path={elbow(cx + 30, 125, rx + bw / 2, 168)} color="#ffa94d" label={"résultat " + fmt(sim.resultSASU)} lx={rx} ly={148} />
      <FlowNode x={rx} y={168} w={bw} h={48} color="#ffa94d" label="🏛️ IS SASU" amount={sim.isSASU.total} sub={isLabel(sim.isSASU)} delay={0.1} />
      <FlowEdge path={vL(rx + bw / 2, 216, 238)} color="#34d399" />
      <FlowNode x={rx} y={238} w={bw} h={50} color="#34d399" label="📊 Dividendes" amount={sim.divBrut} sub="95% exonéré IS" delay={0.14} />
      <FlowEdge path={`M${cx - 30},125 L${cx - 30},155 L${cx - 70},155 L${cx - 70},350`} color="#fbbf24" label={"mandat " + fmt(sim.mandatAn)} lx={15} ly={240} />
      <FlowEdge path={elbow(rx + bw / 2, 288, cx + 40, 350)} color="#34d399" label="mère-fille" lx={cx + 50} ly={322} />
      <FlowNode x={cx - bw / 2} y={350} w={bw} h={55} color="#fbbf24" label="🏢 Holding" amount={sim.dispo} sub="cash: mandat + div." delay={0.18} />
      <FlowEdge path={elbow(cx - 25, 405, lx + bw / 2, 465)} color="#fbbf24" label={"salaire " + fmt(sim.nr)} lx={lx} ly={438} />
      <FlowEdge path={elbow(cx + 25, 405, rx + bw / 2, 465)} color="#ffa94d" label={"imposable " + fmt(sim.profitH)} lx={rx} ly={438} />
      <FlowNode x={lx} y={465} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF TNS" amount={sim.co} sub="~43%" delay={0.22} />
      <FlowEdge path={vL(lx + bw / 2, 513, 540)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={lx + bw / 2 + 8} ly={530} />
      <FlowNode x={lx} y={540} w={bw} h={55} color="#fbbf24" label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.26} />
      <FlowNode x={rx} y={465} w={bw} h={48} color="#ffa94d" label="🏛️ IS Holding" amount={sim.is || 0} sub={sim.isH ? isLabel(sim.isH) : ""} delay={0.22} />
      <FlowEdge path={vL(rx + bw / 2, 513, 540)} color="#34d399" />
      <FlowNode x={rx} y={540} w={bw} h={65} color="#34d399" label="📈 Dans la société" amount={sim.ret} sub="Bourse · SCI · Lombard · CCA" delay={0.26} />
    </svg>
  );
}
