"use client";

import { useState, useMemo } from "react";
import {
  PASS, MICRO_CAP, BAREME_IR, PLAFOND_QF, ABATTEMENT_IR,
  MICRO_BNC_TAUX, MICRO_BNC_ABATTEMENT, MICRO_DETAIL,
  TNS_COEFF, TNS_DETAIL,
  SASU_COEFF_TOTAL, SASU_COEFF_NET, SASU_CHARGES_PAT, SASU_CHARGES_SAL, SASU_DETAIL,
  IS_SEUIL_REDUIT, IS_SEUIL_PLF2026, IS_TAUX_REDUIT, IS_TAUX_NORMAL,
  CHARGES_FIXES_SOCIETE, CHARGES_FIXES_HOLDING,
  TRIMESTRE_SEUIL, QUATRE_TRIMESTRES,
} from "../lib/fiscal";

// --- Types ---
interface Line { l: string; a: number; t: "n" | "s" | "c" | "x" }
interface ISResult { is15: number; is25: number; total: number }
interface CotisItem { n: string; a: number; c: string }
interface RetResult { pen: number; tr: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sim = any; // Les objets simulation sont polymorphes, on garde la flexibilité

// --- Moteur fiscal ---
function calcIR(rn: number, p: number): number {
  const parts = p || 1, base = rn * (1 - ABATTEMENT_IR), pp = base / parts;
  let tax = 0, prev = 0;
  for (const [l, r] of BAREME_IR) { if (pp <= prev) break; tax += Math.max(0, Math.min(pp, l) - prev) * r; prev = l; }
  let tot = Math.round(tax * parts);
  if (parts > 1) {
    let a = 0; prev = 0;
    for (const [l, r] of BAREME_IR) { if (base <= prev) break; a += Math.max(0, Math.min(base, l) - prev) * r; prev = l; }
    const ben = Math.round(a) - tot, mx = Math.round((parts - 1) * 2 * PLAFOND_QF);
    if (ben > mx) tot = Math.round(a) - mx;
  }
  return Math.max(0, tot);
}

function calcIS(profit: number, seuil: number = IS_SEUIL_REDUIT): ISResult {
  if (profit <= 0) return { is15: 0, is25: 0, total: 0 };
  const is15 = Math.round(Math.min(profit, seuil) * IS_TAUX_REDUIT);
  const is25 = Math.round(Math.max(0, profit - seuil) * IS_TAUX_NORMAL);
  return { is15, is25, total: is15 + is25 };
}

function fmt(n: number): string { return Math.round(n).toLocaleString("fr-FR") + " €"; }
function isLabel(is: ISResult): string { if (!is || is.total === 0) return "IS : 0 €"; if (is.is25 === 0) return "IS 15% : " + fmt(is.is15); return "IS 15% " + fmt(is.is15) + " + 25% " + fmt(is.is25); }

// --- Sims ---
function simMicro(ca: number, parts: number, isSeuil: number) {
  const co = Math.round(ca * MICRO_BNC_TAUX), rev = ca - co;
  // BNC : abattement 34% → revenu imposable = CA × 0.66, puis on retire l'abattement 10% dans calcIR
  const ir = calcIR(ca * (1 - MICRO_BNC_ABATTEMENT) / (1 - ABATTEMENT_IR), parts);
  return { ca, co, ir, net: rev - ir, rev, ret: 0, lines: [
    { l: "Chiffre d'affaires", a: ca, t: "n" as const },
    { l: "URSSAF (" + (MICRO_BNC_TAUX * 100).toFixed(1).replace(".", ",") + "%)", a: -co, t: "c" as const },
    { l: "Revenu avant IR", a: rev, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

function simTNS_A(ca: number, parts: number, label: string, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, ben = ca - ch, nr = Math.round(ben / TNS_COEFF), co = ben - nr, ir = calcIR(nr, parts);
  return { ca, co: co + ch, ir, net: nr - ir, nr, ret: 0, cotisOnly: co, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "URSSAF TNS (~43%)", a: -co, t: "c" as const }, { l: label || "Revenu net", a: nr, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

function simTNS_B(ca: number, parts: number, sal: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, ben = ca - ch, coS = Math.round(sal * 0.43), profit = Math.max(0, ben - sal - coS);
  const is = calcIS(profit, isSeuil), ret = profit - is.total, ir = calcIR(sal, parts);
  return { ca, co: ch + coS, ir, is: is.total, isD: is, net: sal - ir, nr: sal, ret, cotisOnly: coS, profit, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Salaire " + fmt(sal) + "/an", a: sal, t: "s" as const }, { l: "URSSAF TNS", a: -coS, t: "c" as const },
    { l: "Résultat", a: profit, t: "s" as const }, { l: isLabel(is), a: -is.total, t: "x" as const },
    { l: "Capitalisé dans la société", a: ret, t: "s" as const }, { l: "IR perso", a: -ir, t: "x" as const },
  ] };
}

function simSASU_A(ca: number, parts: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, d = ca - ch, b = Math.round(d / SASU_COEFF_TOTAL), pat = d - b;
  const sal = Math.round(b * SASU_CHARGES_SAL), n = b - sal, ir = calcIR(n, parts);
  return { ca, co: pat + sal + ch, ir, net: n - ir, brut: b, nAv: n, ret: 0, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Charges patronales (~55%)", a: -pat, t: "c" as const }, { l: "Brut", a: b, t: "s" as const },
    { l: "Charges salariales (~22%)", a: -sal, t: "c" as const }, { l: "Net avant IR", a: n, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

function simSASU_B(ca: number, parts: number, sal: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, d = ca - ch, sb = Math.round(sal / SASU_COEFF_NET);
  const pat = Math.round(sb * SASU_CHARGES_PAT), salCh = Math.round(sb * SASU_CHARGES_SAL), ct = sb + pat;
  const profit = Math.max(0, d - ct), is = calcIS(profit, isSeuil), ret = profit - is.total, ir = calcIR(sal, parts);
  return { ca, co: pat + salCh + ch, ir, is: is.total, isD: is, net: sal - ir, brut: sb, ret, profit, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Salaire " + fmt(sal) + "/an", a: sal, t: "s" as const }, { l: "URSSAF", a: -(pat + salCh), t: "c" as const },
    { l: "Résultat", a: profit, t: "s" as const }, { l: isLabel(is), a: -is.total, t: "x" as const },
    { l: "Capitalisé dans la société", a: ret, t: "s" as const }, { l: "IR perso", a: -ir, t: "x" as const },
  ] };
}

function simHolding(ca: number, parts: number, mode: string, sal: number, mandatMonth: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, mandatAn = mandatMonth * 12;
  const resultSASU = Math.max(0, ca - ch - mandatAn);
  const isSASU = calcIS(resultSASU, isSeuil);
  const divBrut = resultSASU - isSASU.total;
  const chH = CHARGES_FIXES_HOLDING;
  const qp = Math.round(divBrut * 0.05);
  const cashDispo = mandatAn + divBrut - chH;
  const sasuL: Line[] = [
    { l: "CA", a: ca, t: "n" }, { l: "Charges SASU", a: -ch, t: "c" },
    { l: "Rémun. mandat présidence", a: -mandatAn, t: "c" },
    { l: "Résultat SASU", a: resultSASU, t: "s" },
    { l: "IS SASU — " + isLabel(isSASU), a: -isSASU.total, t: "x" },
    { l: "Dividendes", a: divBrut, t: "s" },
  ];
  const holdL: Line[] = [
    { l: "Mandat reçu", a: mandatAn, t: "n" },
    { l: "Dividendes reçus (mère-fille)", a: divBrut, t: "n" },
    { l: "dont 95% exonérés IS", a: Math.round(divBrut * 0.95), t: "s" },
    { l: "dont 5% QP imposable", a: qp, t: "c" },
    { l: "Charges holding", a: -chH, t: "c" },
    { l: "Cash disponible", a: cashDispo, t: "s" },
  ];

  if (mode === "A") {
    const nr = Math.round(Math.max(0, cashDispo) / TNS_COEFF);
    const co = Math.max(0, cashDispo) - nr;
    const ir = calcIR(nr, parts);
    return {
      ca, net: nr - ir, ret: 0, nr, dispo: cashDispo,
      divBrut, qp, mandatAn, resultSASU, isSASU, co, ir,
      sasuL, holdL,
      lines: [
        { l: "Rémun. nette gérant", a: nr, t: "s" as const },
        { l: "URSSAF TNS (~43%)", a: -co, t: "c" as const },
        { l: "IS Holding : 0 € (salaire > revenu imposable)", a: 0, t: "x" as const },
        { l: "IR", a: -ir, t: "x" as const },
      ],
    };
  }

  const coS = Math.round(sal * 0.43);
  const salaryCost = sal + coS;
  const taxableIncome = Math.max(0, mandatAn + qp - chH - salaryCost);
  const isH = calcIS(taxableIncome, isSeuil);
  const ret = cashDispo - salaryCost - isH.total;
  const ir = calcIR(sal, parts);
  return {
    ca, net: sal - ir, ret: Math.max(0, ret), nr: sal, dispo: cashDispo,
    divBrut, qp, mandatAn, resultSASU, isSASU, isH,
    taxableIncome, profitH: taxableIncome,
    co: coS, ir, is: isH.total,
    sasuL, holdL,
    lines: [
      { l: "Salaire gérant " + fmt(sal) + "/an", a: sal, t: "s" as const },
      { l: "URSSAF TNS (~43%)", a: -coS, t: "c" as const },
      { l: "Revenu imposable holding", a: taxableIncome, t: "s" as const },
      { l: "IS Holding — " + isLabel(isH), a: -isH.total, t: "x" as const },
      { l: "Cash capitalisé dans la société", a: Math.max(0, ret), t: "s" as const },
      { l: "IR perso", a: -ir, t: "x" as const },
    ],
  };
}

// --- Retraite & cotisations ---
function retInfo(t: string, r: number, b: number): RetResult {
  if (t === "micro") {
    const tr = Math.min(4, Math.floor(r / TRIMESTRE_SEUIL));
    return { pen: Math.round(Math.min(r * .9, PASS) * .5 / 12 * .55), tr };
  }
  if (t === "tns") {
    const tr = r > QUATRE_TRIMESTRES ? 4 : Math.min(4, Math.floor(r / TRIMESTRE_SEUIL));
    return { pen: Math.round(Math.min(r, PASS) * .5 / 12 + r * TNS_DETAIL.retraiteCompl * .06 * 12), tr };
  }
  const br = b || r / SASU_COEFF_NET;
  const tr = br > QUATRE_TRIMESTRES ? 4 : Math.min(4, Math.floor(br / TRIMESTRE_SEUIL));
  return { pen: Math.round(Math.min(br, PASS) * .5 / 12 + br * .0625 / 18 * 1.4), tr };
}

const mkTNS = (r: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(r * TNS_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite base", a: Math.round(Math.min(r, PASS) * TNS_DETAIL.retraiteBase), c: "✅" },
  { n: "👴 Retraite compl.", a: Math.round(r * TNS_DETAIL.retraiteCompl), c: "⚠️" },
  { n: "💰 CSG/CRDS", a: Math.round(r * TNS_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

const mkSASU = (b: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(b * SASU_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite base", a: Math.round(b * SASU_DETAIL.retraiteBase), c: "✅" },
  { n: "👴 AGIRC-ARRCO", a: Math.round(b * SASU_DETAIL.agircArrco), c: "✅✅" },
  { n: "💰 CSG/CRDS", a: Math.round(b * SASU_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

const mkMicro = (ca: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(ca * MICRO_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite", a: Math.round(ca * MICRO_DETAIL.retraite), c: "⚠️" },
  { n: "💰 CSG/CRDS", a: Math.round(ca * MICRO_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

// ===== SVG FLOW =====
const FCSS = `.fl{stroke-dasharray:8 5;animation:fd 1.2s linear infinite}@keyframes fd{to{stroke-dashoffset:-13}}.fn{animation:fi .4s ease both}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`;

function FN({ x, y, w, h, color, label, amount, sub, delay }: { x: number; y: number; w: number; h: number; color: string; label: string; amount: number; sub?: string; delay?: number }) {
  return <g className="fn" style={{ animationDelay: (delay || 0) + "s" }}>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#0d0d20" stroke={color + "55"} strokeWidth={1.5} />
    <rect x={x} y={y} width={w} height={3} rx={1.5} fill={color} opacity={0.7} />
    <text x={x + w / 2} y={y + 16} textAnchor="middle" fill={color} fontSize={9.5} fontWeight={600} fontFamily="var(--font-inter),sans-serif">{label}</text>
    <text x={x + w / 2} y={y + 33} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700} fontFamily="var(--font-jetbrains),monospace">{fmt(amount)}</text>
    {sub && <text x={x + w / 2} y={y + 46} textAnchor="middle" fill="#555" fontSize={7.5} fontFamily="var(--font-inter),sans-serif">{sub}</text>}
  </g>;
}

function FL({ path, color, label, lx, ly }: { path: string; color: string; label?: string; lx?: number; ly?: number }) {
  return <g>
    <path d={path} fill="none" stroke={color + "18"} strokeWidth={6} />
    <path d={path} fill="none" stroke={color} strokeWidth={2} className="fl" opacity={0.7} />
    <circle r={3.5} fill={color} opacity={0.9}><animateMotion dur="2s" repeatCount="indefinite" path={path} /></circle>
    {label && lx !== undefined && ly !== undefined && <g><rect x={lx - 3} y={ly - 10} width={label.length * 5.2 + 8} height={14} rx={3} fill="#0d0d20" opacity={0.9} /><text x={lx + 1} y={ly} fill={color} fontSize={8} fontWeight={500} fontFamily="var(--font-inter),sans-serif" opacity={0.9}>{label}</text></g>}
  </g>;
}

function vL(x: number, y1: number, y2: number) { return `M${x},${y1}L${x},${y2}`; }
function elbow(x1: number, y1: number, x2: number, y2: number) { const my = y1 + (y2 - y1) * 0.5; return `M${x1},${y1}L${x1},${my}L${x2},${my}L${x2},${y2}`; }

function FlowSimple({ sim, accent, icon, name, chargeLabel }: { sim: Sim; accent: string; icon: string; name: string; chargeLabel: string }) {
  const W = 380, bw = 155, cx = W / 2, g = 22, bh = 50;
  const y0 = 15, y1 = y0 + bh + g, y2 = y1 + bh + g, y3 = y2 + bh + g;
  return <svg viewBox={`0 0 ${W} ${y3 + 55}`} width="100%" style={{ maxWidth: 380, display: "block", margin: "0 auto" }}>
    <style>{FCSS}</style>
    <FN x={cx - bw / 2} y={y0} w={bw} h={bh} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
    <FL path={vL(cx, y0 + bh, y1)} color={accent} label="CA" lx={cx + 8} ly={y0 + bh + g / 2 + 3} />
    <FN x={cx - bw / 2} y={y1} w={bw} h={bh} color={accent} label={icon + " " + name} amount={sim.ca} delay={0.1} />
    <FL path={vL(cx, y1 + bh, y2)} color="#ff6b6b" label={"URSSAF " + chargeLabel} lx={cx + 8} ly={y1 + bh + g / 2 + 3} />
    <FN x={cx - bw / 2} y={y2} w={bw} h={bh} color="#ff6b6b" label="📋 URSSAF" amount={sim.co} sub={chargeLabel} delay={0.2} />
    <FL path={vL(cx, y2 + bh, y3)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={cx + 8} ly={y2 + bh + g / 2 + 3} />
    <FN x={cx - bw / 2} y={y3} w={bw} h={55} color={accent} label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.3} />
  </svg>;
}

function FlowSplitG({ sim, accent, icon, name, capSub }: { sim: Sim; accent: string; icon: string; name: string; capSub: string }) {
  const W = 500, bw = 150, lx = 18, rx = W - 18 - bw;
  return <svg viewBox={`0 0 ${W} 430`} width="100%" style={{ maxWidth: 500, display: "block", margin: "0 auto" }}>
    <style>{FCSS}</style>
    <FN x={W / 2 - 70} y={10} w={140} h={48} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
    <FL path={vL(W / 2, 58, 85)} color={accent} />
    <FN x={W / 2 - 78} y={85} w={156} h={48} color={accent} label={icon + " " + name} amount={sim.ca - CHARGES_FIXES_SOCIETE} sub="après charges" delay={0.08} />
    <FL path={elbow(W / 2 - 20, 133, lx + bw / 2, 195)} color={accent} label="salaire" lx={lx + 5} ly={165} />
    <FL path={elbow(W / 2 + 20, 133, rx + bw / 2, 195)} color="#ffa94d" label="bénéfice" lx={rx + 5} ly={165} />
    <FN x={lx} y={195} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF" amount={sim.cotisOnly || sim.co - CHARGES_FIXES_SOCIETE} delay={0.15} />
    <FL path={vL(lx + bw / 2, 243, 275)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={lx + bw / 2 + 8} ly={262} />
    <FN x={lx} y={275} w={bw} h={55} color={accent} label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.2} />
    <FN x={rx} y={195} w={bw} h={48} color="#ffa94d" label={"🏛️ " + (sim.isD ? isLabel(sim.isD) : "IS")} amount={sim.is || 0} delay={0.15} />
    <FL path={vL(rx + bw / 2, 243, 275)} color="#34d399" />
    <FN x={rx} y={275} w={bw} h={55} color="#34d399" label="💰 Dans la société" amount={sim.ret} sub={capSub} delay={0.2} />
  </svg>;
}

function FlowHoldingA({ sim }: { sim: Sim }) {
  const W = 500, bw = 155, cx = W / 2, rx = W - 30 - bw;
  return <svg viewBox={`0 0 ${W} 620`} width="100%" style={{ maxWidth: 500, display: "block", margin: "0 auto" }}>
    <style>{FCSS}</style>
    <FN x={cx - 70} y={10} w={140} h={45} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
    <FL path={vL(cx, 55, 75)} color="#c084fc" label="CA" lx={cx + 8} ly={67} />
    <FN x={cx - 85} y={75} w={170} h={50} color="#c084fc" label="🏛️ SASU" amount={sim.ca} sub="opérationnelle" delay={0.05} />
    <FL path={elbow(cx + 30, 125, rx + bw / 2, 165)} color="#ffa94d" label={"résultat " + fmt(sim.resultSASU)} lx={rx} ly={148} />
    <FN x={rx} y={165} w={bw} h={48} color="#ffa94d" label="🏛️ IS SASU" amount={sim.isSASU.total} sub={isLabel(sim.isSASU)} delay={0.1} />
    <FL path={vL(rx + bw / 2, 213, 235)} color="#34d399" />
    <FN x={rx} y={235} w={bw} h={50} color="#34d399" label="📊 Dividendes" amount={sim.divBrut} sub="95% exonéré IS" delay={0.15} />
    <FL path={`M${cx - 30},125 L${cx - 30},155 L${cx - 60},155 L${cx - 60},345`} color="#fbbf24" label={"mandat " + fmt(sim.mandatAn)} lx={20} ly={240} />
    <FL path={elbow(rx + bw / 2, 285, cx + 40, 345)} color="#34d399" label={"mère-fille " + fmt(sim.divBrut)} lx={cx + 50} ly={318} />
    <FN x={cx - bw / 2} y={345} w={bw} h={55} color="#fbbf24" label="🏢 Holding" amount={sim.dispo} sub="cash: mandat + div. - charges" delay={0.2} />
    <FL path={vL(cx, 400, 430)} color="#ff6b6b" label="salaire gérant" lx={cx + 8} ly={418} />
    <FN x={cx - bw / 2} y={430} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF TNS" amount={sim.co} sub="~43%" delay={0.25} />
    <FL path={vL(cx, 478, 505)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={cx + 8} ly={494} />
    <FN x={cx - bw / 2} y={505} w={bw} h={55} color="#fbbf24" label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.3} />
  </svg>;
}

function FlowHoldingB({ sim }: { sim: Sim }) {
  const W = 520, bw = 155, cx = W / 2, lx = 15, rx = W - 15 - bw;
  return <svg viewBox={`0 0 ${W} 700`} width="100%" style={{ maxWidth: 520, display: "block", margin: "0 auto" }}>
    <style>{FCSS}</style>
    <FN x={cx - 70} y={10} w={140} h={45} color="#888" label="👤 Client" amount={sim.ca} delay={0} />
    <FL path={vL(cx, 55, 75)} color="#c084fc" />
    <FN x={cx - 85} y={75} w={170} h={50} color="#c084fc" label="🏛️ SASU" amount={sim.ca} sub="opérationnelle" delay={0.05} />
    <FL path={elbow(cx + 30, 125, rx + bw / 2, 168)} color="#ffa94d" label={"résultat " + fmt(sim.resultSASU)} lx={rx} ly={148} />
    <FN x={rx} y={168} w={bw} h={48} color="#ffa94d" label="🏛️ IS SASU" amount={sim.isSASU.total} sub={isLabel(sim.isSASU)} delay={0.1} />
    <FL path={vL(rx + bw / 2, 216, 238)} color="#34d399" />
    <FN x={rx} y={238} w={bw} h={50} color="#34d399" label="📊 Dividendes" amount={sim.divBrut} sub="95% exonéré IS" delay={0.14} />
    <FL path={`M${cx - 30},125 L${cx - 30},155 L${cx - 70},155 L${cx - 70},350`} color="#fbbf24" label={"mandat " + fmt(sim.mandatAn)} lx={15} ly={240} />
    <FL path={elbow(rx + bw / 2, 288, cx + 40, 350)} color="#34d399" label="mère-fille" lx={cx + 50} ly={322} />
    <FN x={cx - bw / 2} y={350} w={bw} h={55} color="#fbbf24" label="🏢 Holding" amount={sim.dispo} sub="cash: mandat + div." delay={0.18} />
    <FL path={elbow(cx - 25, 405, lx + bw / 2, 465)} color="#fbbf24" label={"salaire " + fmt(sim.nr)} lx={lx} ly={438} />
    <FL path={elbow(cx + 25, 405, rx + bw / 2, 465)} color="#ffa94d" label={"imposable " + fmt(sim.profitH)} lx={rx} ly={438} />
    <FN x={lx} y={465} w={bw} h={48} color="#ff6b6b" label="📋 URSSAF TNS" amount={sim.co} sub="~43%" delay={0.22} />
    <FL path={vL(lx + bw / 2, 513, 540)} color="#ffa94d" label={"IR " + fmt(sim.ir)} lx={lx + bw / 2 + 8} ly={530} />
    <FN x={lx} y={540} w={bw} h={55} color="#fbbf24" label="👤 Vous" amount={sim.net} sub={fmt(Math.round(sim.net / 12)) + "/mois"} delay={0.26} />
    <FN x={rx} y={465} w={bw} h={48} color="#ffa94d" label="🏛️ IS Holding" amount={sim.is || 0} sub={sim.isH ? isLabel(sim.isH) : ""} delay={0.22} />
    <FL path={vL(rx + bw / 2, 513, 540)} color="#34d399" />
    <FN x={rx} y={540} w={bw} h={65} color="#34d399" label="📈 Dans la société" amount={sim.ret} sub="Bourse · SCI · Lombard · CCA" delay={0.26} />
  </svg>;
}

// ===== UI =====
function Bar({ v, mx, c }: { v: number; mx: number; c: string }) {
  const pct = mx > 0 ? Math.min(Math.max(v / mx * 100, 0), 100) : 0;
  return <div style={{ width: "100%", height: 8, background: "#1a1a2e", borderRadius: 4, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: c, borderRadius: 4, transition: "width .4s" }} /></div>;
}

function LI({ d }: { d: Line }) {
  const c = d.t === "s" ? "#fff" : d.t === "c" ? "#ff6b6b" : d.t === "x" ? "#ffa94d" : "#ccc";
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #1a1a3e", fontSize: 13 }}>
    <span style={{ color: c, fontWeight: d.t === "s" ? 600 : 400 }}>{d.l}</span>
    <span style={{ color: d.a < 0 ? "#ff6b6b" : c, fontWeight: d.t === "s" ? 600 : 400, whiteSpace: "nowrap", marginLeft: 8 }}>{d.a >= 0 ? fmt(d.a) : "- " + fmt(Math.abs(d.a))}</span>
  </div>;
}

function BarsViz({ items, mx }: { items: [string, number, string][]; mx: number }) {
  return <div>{items.map(([l, v, c], i) => <div key={i} style={{ marginBottom: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}><span style={{ color: c }}>{l}</span><span style={{ color: c, fontWeight: 600 }}>{fmt(v)}</span></div>
    <Bar v={v} mx={mx} c={c} />
  </div>)}</div>;
}

function CapUsage({ type }: { type: string }) {
  const data: Record<string, { t: string; c: string; i: string[][] }> = {
    eurl: { t: "💡 Capital dans la société (EURL)", c: "#34d399", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Soumis TNS > 10% capital"], ["⚠️ Bourse", "Risque requalification"]] },
    sasu: { t: "💡 Capital dans la société (SASU)", c: "#34d399", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Flat tax 30% SANS cotisations"], ["⚠️ Bourse", "Change l'objet social"]] },
    holding: { t: "💡 Capital dans la société (Holding)", c: "#34d399", i: [["✅ Bourse / ETF", "Investir à l'IS"], ["✅ Crédit Lombard", "Emprunter sans vendre"], ["✅ SCI / Immobilier", "Via la holding"], ["✅ Prêt CCA", "Remboursement non imposé"], ["🔥 Levier fiscal", "IS 15-25% vs IR 30-45%"]] },
    ei: { t: "💡 Capital dans l'EI (IS)", c: "#34d399", i: [["✅ Matériel / Trésorerie", "Investissement"], ["⚠️ Patrimoine", "Séparé depuis 2022 mais pas de personnalité morale"]] },
  };
  const d = data[type]; if (!d) return null;
  return <div style={{ padding: 12, background: "#0a0a1a", borderRadius: 10 }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: d.c, marginBottom: 6 }}>{d.t}</div>
    {d.i.map((it, i) => <div key={i} style={{ fontSize: 13, marginBottom: 3, color: it[0].startsWith("❌") ? "#ff6b6b" : it[0].startsWith("⚠") ? "#ffa94d" : it[0].startsWith("🔥") ? "#fbbf24" : "#ccc" }}>
      <strong>{it[0]}</strong>{" — "}<span style={{ color: "#666" }}>{it[1]}</span>
    </div>)}
  </div>;
}

function CotisT({ items, accent }: { items: CotisItem[]; accent: string }) {
  return <div style={{ padding: 12, background: "#0a0a1a", borderRadius: 10 }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: accent, marginBottom: 6 }}>{"🔍 Cotisations"}</div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><tbody>
      {items.map((it, i) => <tr key={i}>
        <td style={{ padding: "4px", borderBottom: "1px solid #0d0d25", color: "#bbb" }}>{it.n}</td>
        <td style={{ padding: "4px", borderBottom: "1px solid #0d0d25", color: it.a > 0 ? "#ff8a8a" : "#444", fontWeight: 500, textAlign: "right", width: 70 }}>{it.a > 0 ? fmt(it.a) : "—"}</td>
        <td style={{ padding: "4px", borderBottom: "1px solid #0d0d25", color: it.c.startsWith("❌") ? "#ff6b6b" : it.c.startsWith("⚠") ? "#ffa94d" : "#66d9a0", fontSize: 12 }}>{it.c}</td>
      </tr>)}
    </tbody></table>
  </div>;
}

function RetB({ info }: { info: RetResult }) {
  return <div style={{ padding: 10, background: "#0a0a1a", borderRadius: 10, fontSize: 13, color: "#888" }}>
    {"👴 Retraite — Pension : "}<strong style={{ color: "#fff" }}>{"~" + fmt(info.pen) + "/mois"}</strong>
    {" · Trimestres/an : "}<strong style={{ color: info.tr >= 4 ? "#34d399" : "#ffa94d" }}>{info.tr + "/4"}</strong>
    <br /><span style={{ color: "#555" }}>{"Carrière complète = 43 ans (172 trimestres, né(e) après 1973)"}</span>
  </div>;
}

interface ToggleOption { v: string; l: string; c?: string }
function Toggle({ options, value, onChange, size }: { options: ToggleOption[]; value: string; onChange: (v: string) => void; size?: string }) {
  const s = size || "normal";
  return <div style={{ display: "inline-flex", background: "#1a1a3e", borderRadius: 6, padding: 2 }}>
    {options.map(o => <button key={o.v} onClick={() => onChange(o.v)} style={{
      padding: s === "sm" ? "3px 8px" : "4px 12px", borderRadius: 5, border: "none", cursor: "pointer",
      background: value === o.v ? o.c || "#c084fc" : "transparent",
      color: value === o.v ? "#000" : "#666",
      fontWeight: 600, fontSize: s === "sm" ? 11 : 13, fontFamily: "var(--font-inter),sans-serif",
    }}>{o.l}</button>)}
  </div>;
}

// ===== MAIN =====
export default function App() {
  const [ca, setCa] = useState(100000);
  const [parts, setParts] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const [microTab, setMicroTab] = useState("hypo");
  const [gm, setGm] = useState("A");
  const [salB, setSalB] = useState(20400);
  const [mandatM, setMandatM] = useState(6000);
  const [tab, setTab] = useState("overview");
  const [regEI, setRegEI] = useState("IS");
  const [regEURL, setRegEURL] = useState("IS");
  const [regSASU, setRegSASU] = useState("IS");
  const [isSeuilEtendu, setIsSeuilEtendu] = useState(false);

  const isSeuil = isSeuilEtendu ? IS_SEUIL_PLF2026 : IS_SEUIL_REDUIT;
  const mCA = microTab === "real" ? Math.min(ca, MICRO_CAP) : ca;
  const isCapped = ca > MICRO_CAP;
  const maxSalB = Math.max(12000, Math.round((ca - CHARGES_FIXES_SOCIETE) / TNS_COEFF * 0.9));
  const maxMandat = Math.round((ca - CHARGES_FIXES_SOCIETE) / 12);

  const eiCanB = regEI === "IS";
  const eurlCanB = regEURL === "IS";
  const sasuCanB = regSASU === "IS";

  const S = useMemo(() => ({
    micro: simMicro(mCA, parts, isSeuil),
    ei_A: simTNS_A(ca, parts, regEI === "IS" ? "Rémun. nette" : "Revenu net", isSeuil),
    ei_B: regEI === "IS" ? simTNS_B(ca, parts, salB, isSeuil) : null,
    eurl_A: simTNS_A(ca, parts, "Rémun. nette", isSeuil),
    eurl_B: regEURL === "IS" ? simTNS_B(ca, parts, salB, isSeuil) : null,
    sasu_A: simSASU_A(ca, parts, isSeuil),
    sasu_B: regSASU === "IS" ? simSASU_B(ca, parts, salB, isSeuil) : null,
    hold_A: simHolding(ca, parts, "A", salB, mandatM, isSeuil),
    hold_B: simHolding(ca, parts, "B", salB, mandatM, isSeuil),
  }), [ca, parts, mCA, salB, mandatM, regEI, regEURL, regSASU, isSeuil]);

  function getData(id: string) {
    if (id === "micro") return { net: S.micro.net, ret: 0, dCA: mCA };
    if (id === "ei") { const s = (eiCanB && gm === "B" && S.ei_B) ? S.ei_B : S.ei_A; return { net: s.net, ret: s.ret || 0, dCA: ca }; }
    if (id === "eurl") { const s = (eurlCanB && gm === "B" && S.eurl_B) ? S.eurl_B : S.eurl_A; return { net: s.net, ret: s.ret || 0, dCA: ca }; }
    if (id === "sasu") { const s = (sasuCanB && gm === "B" && S.sasu_B) ? S.sasu_B : S.sasu_A; return { net: s.net, ret: s.ret || 0, dCA: ca }; }
    const s = gm === "A" ? S.hold_A : S.hold_B; return { net: s.net, ret: s.ret || 0, dCA: ca };
  }

  const structs = [
    { id: "micro", name: "Micro", icon: "🧑‍💻", color: "#2563eb", accent: "#60a5fa", noB: true },
    { id: "ei", name: "EI " + regEI, icon: "📋", color: "#0891b2", accent: "#22d3ee", noB: !eiCanB },
    { id: "eurl", name: "EURL " + regEURL, icon: "🏢", color: "#059669", accent: "#34d399", noB: !eurlCanB },
    { id: "sasu", name: "SASU " + regSASU, icon: "🏛️", color: "#9333ea", accent: "#c084fc", noB: !sasuCanB },
    { id: "holding", name: "SASU+Holding", icon: "🐟", color: "#d97706", accent: "#fbbf24", noB: false },
  ];

  const openD = (id: string) => { setSel(sel === id ? null : id); setTab("overview"); };

  const microTauxLabel = (MICRO_BNC_TAUX * 100).toFixed(1).replace(".", ",") + "% du CA";

  function renderDetail() {
    if (!sel) return null;
    const st = structs.find(s => s.id === sel)!;
    const isB = gm === "B" && !st.noB;
    let sim: Sim, cotisItems: CotisItem[], retData: RetResult, flowEl: React.ReactNode, regToggle: React.ReactNode = null;

    if (sel === "micro") {
      sim = S.micro; cotisItems = mkMicro(mCA); retData = retInfo("micro", sim.rev, 0);
      flowEl = <FlowSimple sim={sim} accent="#60a5fa" icon="🧑‍💻" name="Micro" chargeLabel={microTauxLabel} />;
    } else if (sel === "ei") {
      regToggle = <Toggle options={[{ v: "IR", l: "IR", c: "#22d3ee" }, { v: "IS", l: "IS (depuis 2022)", c: "#f59e0b" }]} value={regEI} onChange={setRegEI} />;
      sim = (eiCanB && isB && S.ei_B) ? S.ei_B : S.ei_A;
      cotisItems = mkTNS(isB && eiCanB ? salB : sim.nr); retData = retInfo("tns", isB && eiCanB ? salB : sim.nr, 0);
      flowEl = (eiCanB && isB) ? <FlowSplitG sim={sim} accent="#22d3ee" icon="📋" name="EI IS" capSub="Matériel · Trésorerie" /> : <FlowSimple sim={sim} accent="#22d3ee" icon="📋" name={"EI " + regEI} chargeLabel="TNS ~43%" />;
    } else if (sel === "eurl") {
      regToggle = <Toggle options={[{ v: "IR", l: "IR (transparent)", c: "#34d399" }, { v: "IS", l: "IS", c: "#f59e0b" }]} value={regEURL} onChange={setRegEURL} />;
      sim = (eurlCanB && isB && S.eurl_B) ? S.eurl_B : S.eurl_A;
      cotisItems = mkTNS(isB && eurlCanB ? salB : sim.nr); retData = retInfo("tns", isB && eurlCanB ? salB : sim.nr, 0);
      flowEl = (eurlCanB && isB) ? <FlowSplitG sim={sim} accent="#34d399" icon="🏢" name="EURL IS" capSub="Embauche · Matériel" /> : <FlowSimple sim={sim} accent="#34d399" icon="🏢" name={"EURL " + regEURL} chargeLabel="TNS ~43%" />;
    } else if (sel === "sasu") {
      regToggle = <Toggle options={[{ v: "IR", l: "IR (5 ans max)", c: "#c084fc" }, { v: "IS", l: "IS", c: "#f59e0b" }]} value={regSASU} onChange={setRegSASU} />;
      sim = (sasuCanB && isB && S.sasu_B) ? S.sasu_B : S.sasu_A;
      cotisItems = mkSASU(sim.brut || Math.round((isB && sasuCanB ? salB : sim.nAv || 20400) / SASU_COEFF_NET));
      retData = retInfo("salarie", sim.nAv || salB, sim.brut);
      flowEl = (sasuCanB && isB) ? <FlowSplitG sim={{ ...sim, cotisOnly: sim.co - CHARGES_FIXES_SOCIETE }} accent="#c084fc" icon="🏛️" name="SASU IS" capSub="Div. flat tax 30%" /> : <FlowSimple sim={sim} accent="#c084fc" icon="🏛️" name={"SASU " + regSASU} chargeLabel={regSASU === "IS" ? "~77% du brut" : "~77% (transparent)"} />;
    } else {
      sim = isB ? S.hold_B : S.hold_A;
      cotisItems = mkTNS(isB ? salB : (sim.nr || salB)); retData = retInfo("tns", isB ? salB : (sim.nr || salB), 0);
      flowEl = isB ? <FlowHoldingB sim={sim} /> : <FlowHoldingA sim={sim} />;
    }

    const tabItems = [{ k: "overview", l: "📋 Synthèse" }, { k: "flow", l: "📊 Flux" }, { k: "cotis", l: "🔍 Cotisations" }];
    if (isB) tabItems.push({ k: "capital", l: "💡 Capital" });

    return (
      <div style={{ background: "#111128", border: "2px solid " + st.color + "40", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 18px 0", background: st.color + "06" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontFamily: "var(--font-inter),sans-serif", fontSize: 20, fontWeight: 700, color: st.accent, margin: 0 }}>{st.icon + " " + st.name}<span style={{ fontSize: 13, color: "#555", fontWeight: 400 }}>{" · Mode " + (st.noB ? "A" : gm)}{regToggle && !st.noB && gm === "B" && " · Capitalise"}</span></h2>
            {regToggle && <div>{regToggle}</div>}
          </div>
          {sel === "micro" && isCapped && <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
            <button onClick={e => { e.stopPropagation(); setMicroTab("hypo"); }} style={{ padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: microTab === "hypo" ? "#f59e0b" : "#1a1a3e", color: microTab === "hypo" ? "#000" : "#888", fontWeight: 600, fontSize: 10 }}>{fmt(ca) + " — Hypothétique"}</button>
            <button onClick={e => { e.stopPropagation(); setMicroTab("real"); setCa(MICRO_CAP); }} style={{ padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: microTab === "real" ? "#2563eb" : "#1a1a3e", color: microTab === "real" ? "#fff" : "#888", fontWeight: 600, fontSize: 10 }}>{fmt(MICRO_CAP) + " — Plafond réel"}</button>
          </div>}
          {sel === "holding" && <div style={{ padding: "6px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <span style={{ fontSize: 13, color: "#888" }}>{"🏛️ Rémun. mandat présidence"}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#c084fc", fontFamily: "var(--font-inter)" }}>{fmt(mandatM) + "/mois"}<span style={{ fontSize: 11, color: "#555", fontWeight: 400 }}>{" = " + fmt(mandatM * 12) + "/an"}</span></span>
            </div>
            <input type="range" min={1000} max={Math.max(maxMandat, 2000)} step={500} value={mandatM} onChange={e => setMandatM(+e.target.value)} style={{ width: "100%", accentColor: "#c084fc", cursor: "pointer" }} />
          </div>}
          {isB && <div style={{ padding: "6px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <span style={{ fontSize: 13, color: "#888" }}>{"💰 Salaire net gérant"}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: st.accent, fontFamily: "var(--font-inter)" }}>{fmt(Math.round(salB / 12)) + "/mois"}<span style={{ fontSize: 11, color: "#555", fontWeight: 400 }}>{" = " + fmt(salB) + "/an"}</span></span>
            </div>
            <input type="range" min={6000} max={maxSalB} step={1200} value={salB} onChange={e => setSalB(+e.target.value)} style={{ width: "100%", accentColor: st.accent, cursor: "pointer" }} />
          </div>}
          {!st.noB && gm === "B" && ((sel === "ei" && regEI === "IR") || (sel === "eurl" && regEURL === "IR") || (sel === "sasu" && regSASU === "IR")) && <div style={{ padding: "5px 10px", background: "#ffa94d15", border: "1px solid #ffa94d30", borderRadius: 6, fontSize: 12, color: "#ffa94d", marginBottom: 6 }}>{"⚠️ À l'IR, pas de capitalisation possible — le bénéfice est imposé directement à l'IR. Mode A forcé."}</div>}
          <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
            {tabItems.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "13px 0", border: "none", cursor: "pointer", flex: 1, background: tab === t.k ? "#111128" : "transparent", borderTop: tab === t.k ? "3px solid " + st.accent : "3px solid transparent", color: tab === t.k ? "#fff" : "#555", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-inter),sans-serif" }}>{t.l}</button>)}
          </div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          {tab === "overview" && <div>
            {sel === "holding" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "#c084fc", marginBottom: 4 }}>{"🏛️ SASU"}</div>{sim.sasuL.map((d: Line, i: number) => <LI key={i} d={d} />)}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", marginBottom: 4 }}>{"🏢 Holding"}</div>{sim.holdL.map((d: Line, i: number) => <LI key={i} d={d} />)}</div>
            </div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>{sim.lines.map((d: Line, i: number) => <LI key={i} d={d} />)}<div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid " + st.accent, marginTop: 4, fontSize: 18, fontWeight: 700, color: st.accent }}><span>{"💰 Net"}</span><span>{fmt(sim.net)}</span></div>{sim.ret > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 15, fontWeight: 700, color: "#34d399" }}><span>{"📈 Dans la société"}</span><span>{fmt(sim.ret)}</span></div>}</div>
              <BarsViz items={[["URSSAF", sim.co, "#ff6b6b"], [sim.is ? "IS + IR" : "IR", (sim.is || 0) + sim.ir, "#ffa94d"], ["Net perso", sim.net, st.accent], ...(sim.ret > 0 ? [["Dans la société" as string, sim.ret as number, "#34d399" as string] as [string, number, string]] : [])]} mx={ca} />
            </div>
          </div>}
          {tab === "flow" && flowEl}
          {tab === "cotis" && <div style={{ display: "grid", gap: 10 }}><CotisT items={cotisItems} accent={st.accent} /><RetB info={retData} /></div>}
          {tab === "capital" && isB && <CapUsage type={sel === "holding" ? "holding" : sel} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-inter),sans-serif", background: "#0a0a1a", color: "#e0e0e0", minHeight: "100vh", padding: "16px 10px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h1 style={{ fontFamily: "var(--font-inter),sans-serif", fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 }}>Simulateur Freelance Dev</h1>
          <p style={{ color: "#555", fontSize: 12, marginTop: 3 }}>Comparez 5 statuts · Barème 2026 · Ajustez CA, régime fiscal et stratégie</p>
        </div>
        <div style={{ background: "#111128", borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
          {/* Ligne 1 : slider CA pleine largeur */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#888" }}>CA annuel HT</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "var(--font-inter)" }}>{fmt(ca)}</span>
            </div>
            <input type="range" min={30000} max={500000} step={5000} value={ca} onChange={e => setCa(+e.target.value)} style={{ width: "100%", accentColor: "#c084fc", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#444", marginTop: 2 }}><span>30k</span><span>100k</span><span>200k</span><span>300k</span><span>500k</span></div>
            {isCapped && <div style={{ marginTop: 4, fontSize: 11, color: "#ffa94d" }}>{"⚠️ Micro plafonné à " + fmt(MICRO_CAP)}</div>}
          </div>
          {/* Ligne 2 : Parts IR | Stratégie | IS 15% */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "start", borderTop: "1px solid #1a1a3e", paddingTop: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 5 }}>Parts IR</div>
              <div style={{ display: "flex", gap: 3 }}>{[1, 1.5, 2, 2.5, 3].map(p => <button key={p} onClick={() => setParts(p)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: parts === p ? "#c084fc" : "#1a1a3e", color: parts === p ? "#000" : "#888", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-inter)" }}>{p}</button>)}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>1=célib · 2=couple · +0.5/enfant</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 5 }}>Stratégie</div>
              <div style={{ display: "inline-flex", gap: 3 }}>
                <button onClick={() => setGm("A")} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: gm === "A" ? "#34d399" : "#1a1a3e", color: gm === "A" ? "#000" : "#888", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-inter)" }}>A — Tout en salaire</button>
                <button onClick={() => setGm("B")} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: gm === "B" ? "#f59e0b" : "#1a1a3e", color: gm === "B" ? "#000" : "#888", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-inter)" }}>B — Capitaliser</button>
              </div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>B = salaire choisi + capital en société (IS requis)</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 5 }}>Seuil IS 15%</div>
              <Toggle options={[
                { v: "standard", l: "≤ " + fmt(IS_SEUIL_REDUIT), c: "#34d399" },
                { v: "plf2026", l: "≤ " + fmt(IS_SEUIL_PLF2026), c: "#f59e0b" },
              ]} value={isSeuilEtendu ? "plf2026" : "standard"} onChange={v => setIsSeuilEtendu(v === "plf2026")} size="sm" />
              {isSeuilEtendu && <div style={{ fontSize: 9, color: "#f59e0b", marginTop: 3, lineHeight: 1.4, maxWidth: 220, marginLeft: "auto" }}>
                <a href="https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/2531" target="_blank" rel="noopener noreferrer" style={{ color: "#f59e0b", textDecoration: "underline" }}>Amendement I-2531</a> — voté en 1ère lecture (oct. 2025). Passage au Sénat puis promulgation attendue fin 2026.
              </div>}
              {gm === "A" && <div style={{ fontSize: 9, color: "#555", marginTop: 2, textAlign: "right" }}>Effet visible en mode B uniquement</div>}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginBottom: 14 }}>
          {structs.map(st => { const d = getData(st.id); const total = d.net + d.ret; const showB = gm === "B" && !st.noB; return <div key={st.id} onClick={() => openD(st.id)} style={{ background: sel === st.id ? st.color + "15" : "#111128", border: "2px solid " + (sel === st.id ? st.color : "#1a1a3e"), borderRadius: 11, padding: 12, cursor: "pointer", transition: "all .3s", position: "relative" }}>
            {st.id === "micro" && isCapped && microTab === "real" && <div style={{ position: "absolute", top: -8, left: 6, background: "#ef4444", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>PLAFONNÉ</div>}
            {st.id === "micro" && isCapped && microTab === "hypo" && <div style={{ position: "absolute", top: -8, left: 6, background: "#f59e0b", color: "#000", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>FICTIF</div>}
            {showB && <div style={{ position: "absolute", top: -8, right: 6, background: "#f59e0b", color: "#000", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>MODE B</div>}
            {st.noB && gm === "B" && <div style={{ position: "absolute", top: -8, right: 6, background: "#555", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>{st.id === "micro" ? "MICRO" : "IR"}</div>}
            <div style={{ fontSize: 20, marginBottom: 3 }}>{st.icon}</div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 12, color: st.accent, marginBottom: 5 }}>{st.name}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{fmt(d.net)}</div>
            <div style={{ fontSize: 10, color: "#777", marginBottom: 3 }}>{d.ret > 0 ? "net perso/an" : "net après IR/an"}</div>
            <div style={{ fontSize: 13, color: "#ccc" }}><span style={{ color: st.accent, fontWeight: 600 }}>{fmt(Math.round(d.net / 12))}</span><span style={{ color: "#444" }}>/mois</span></div>
            {d.ret > 0 && <div style={{ marginTop: 4, padding: "3px 5px", background: "#34d39908", border: "1px solid #34d39920", borderRadius: 4, fontSize: 10, color: "#34d399" }}>{"+ " + fmt(d.ret) + " dans la société"}</div>}
            <div style={{ marginTop: 5, marginBottom: 2 }}><Bar v={total} mx={ca} c={st.accent} /></div>
            <div style={{ fontSize: 9, color: "#444" }}>{d.dCA > 0 ? Math.round(total / d.dCA * 100) : 0}{"% conservé"}</div>
          </div>; })}
        </div>
        {renderDetail()}
        <div style={{ background: "#111128", borderRadius: 8, padding: 10, fontSize: 10, color: "#444", lineHeight: 1.5 }}>{"⚠️ Barème 2026. Simulation simplifiée. Micro BNC (abattement 34%). TNS ~43%, charges SASU ~77%. IS : 15% ≤ " + fmt(isSeuil) + ", 25% au-delà. EI peut opter IS depuis 2022. SASU peut opter IR (5 ans max). Carrière complète = 43 ans. Valider avec un expert-comptable."}</div>
      </div>
    </div>
  );
}
