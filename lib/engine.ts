import {
  PASS, BAREME_IR, PLAFOND_QF, ABATTEMENT_IR,
  MICRO_BNC_TAUX, MICRO_BNC_ABATTEMENT, MICRO_DETAIL,
  TNS_COEFF, TNS_DETAIL,
  SASU_COEFF_TOTAL, SASU_COEFF_NET, SASU_CHARGES_PAT, SASU_CHARGES_SAL, SASU_DETAIL,
  IS_TAUX_REDUIT, IS_TAUX_NORMAL,
  CHARGES_FIXES_SOCIETE, CHARGES_FIXES_HOLDING,
  TRIMESTRE_SEUIL, QUATRE_TRIMESTRES,
} from "./fiscal";
import type { Line, ISResult, CotisItem, RetResult } from "./types";

// --- Moteur fiscal ---
export function calcIR(rn: number, p: number): number {
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

export function calcIS(profit: number, seuil: number): ISResult {
  if (profit <= 0) return { is15: 0, is25: 0, total: 0 };
  const is15 = Math.round(Math.min(profit, seuil) * IS_TAUX_REDUIT);
  const is25 = Math.round(Math.max(0, profit - seuil) * IS_TAUX_NORMAL);
  return { is15, is25, total: is15 + is25 };
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

export function isLabel(is: ISResult): string {
  if (!is || is.total === 0) return "IS : 0 €";
  if (is.is25 === 0) return "IS 15% : " + fmt(is.is15);
  return "IS 15% " + fmt(is.is15) + " + 25% " + fmt(is.is25);
}

// --- Simulations ---
export function simMicro(ca: number, parts: number, isSeuil: number) {
  const co = Math.round(ca * MICRO_BNC_TAUX), rev = ca - co;
  const ir = calcIR(ca * (1 - MICRO_BNC_ABATTEMENT) / (1 - ABATTEMENT_IR), parts);
  return { kind: 'micro' as const, ca, co, ir, net: rev - ir, rev, ret: 0, lines: [
    { l: "Chiffre d'affaires", a: ca, t: "n" as const },
    { l: "URSSAF (" + (MICRO_BNC_TAUX * 100).toFixed(1).replace(".", ",") + "%)", a: -co, t: "c" as const },
    { l: "Revenu avant IR", a: rev, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

export function simTNS_A(ca: number, parts: number, label: string, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, ben = ca - ch, nr = Math.round(ben / TNS_COEFF), co = ben - nr, ir = calcIR(nr, parts);
  return { kind: 'tns_a' as const, ca, co: co + ch, ir, net: nr - ir, nr, ret: 0, cotisOnly: co, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "URSSAF TNS (~43%)", a: -co, t: "c" as const }, { l: label || "Revenu net", a: nr, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

export function simTNS_B(ca: number, parts: number, sal: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, ben = ca - ch, coS = Math.round(sal * 0.43), profit = Math.max(0, ben - sal - coS);
  const is = calcIS(profit, isSeuil), ret = profit - is.total, ir = calcIR(sal, parts);
  return { kind: 'tns_b' as const, ca, co: ch + coS, ir, is: is.total, isD: is, net: sal - ir, nr: sal, ret, cotisOnly: coS, profit, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Salaire " + fmt(sal) + "/an", a: sal, t: "s" as const }, { l: "URSSAF TNS", a: -coS, t: "c" as const },
    { l: "Résultat", a: profit, t: "s" as const }, { l: isLabel(is), a: -is.total, t: "x" as const },
    { l: "Capitalisé dans la société", a: ret, t: "s" as const }, { l: "IR perso", a: -ir, t: "x" as const },
  ] };
}

export function simSASU_A(ca: number, parts: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, d = ca - ch, b = Math.round(d / SASU_COEFF_TOTAL), pat = d - b;
  const sal = Math.round(b * SASU_CHARGES_SAL), n = b - sal, ir = calcIR(n, parts);
  return { kind: 'sasu_a' as const, ca, co: pat + sal + ch, ir, net: n - ir, brut: b, nAv: n, ret: 0, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Charges patronales (~55%)", a: -pat, t: "c" as const }, { l: "Brut", a: b, t: "s" as const },
    { l: "Charges salariales (~22%)", a: -sal, t: "c" as const }, { l: "Net avant IR", a: n, t: "s" as const },
    { l: "IR", a: -ir, t: "x" as const },
  ] };
}

export function simSASU_B(ca: number, parts: number, sal: number, isSeuil: number) {
  const ch = CHARGES_FIXES_SOCIETE, d = ca - ch, sb = Math.round(sal / SASU_COEFF_NET);
  const pat = Math.round(sb * SASU_CHARGES_PAT), salCh = Math.round(sb * SASU_CHARGES_SAL), ct = sb + pat;
  const profit = Math.max(0, d - ct), is = calcIS(profit, isSeuil), ret = profit - is.total, ir = calcIR(sal, parts);
  return { kind: 'sasu_b' as const, ca, co: pat + salCh + ch, ir, is: is.total, isD: is, net: sal - ir, brut: sb, ret, profit, lines: [
    { l: "CA HT", a: ca, t: "n" as const }, { l: "Charges", a: -ch, t: "c" as const },
    { l: "Salaire " + fmt(sal) + "/an", a: sal, t: "s" as const }, { l: "URSSAF", a: -(pat + salCh), t: "c" as const },
    { l: "Résultat", a: profit, t: "s" as const }, { l: isLabel(is), a: -is.total, t: "x" as const },
    { l: "Capitalisé dans la société", a: ret, t: "s" as const }, { l: "IR perso", a: -ir, t: "x" as const },
  ] };
}

export function simHolding(ca: number, parts: number, mode: string, sal: number, mandatMonth: number, isSeuil: number) {
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
      kind: 'holding_a' as const,
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
    kind: 'holding_b' as const,
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
export function retInfo(t: string, r: number, b: number): RetResult {
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

export const mkTNS = (r: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(r * TNS_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite base", a: Math.round(Math.min(r, PASS) * TNS_DETAIL.retraiteBase), c: "✅" },
  { n: "👴 Retraite compl.", a: Math.round(r * TNS_DETAIL.retraiteCompl), c: "⚠️" },
  { n: "💰 CSG/CRDS", a: Math.round(r * TNS_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

export const mkSASU = (b: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(b * SASU_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite base", a: Math.round(b * SASU_DETAIL.retraiteBase), c: "✅" },
  { n: "👴 AGIRC-ARRCO", a: Math.round(b * SASU_DETAIL.agircArrco), c: "✅✅" },
  { n: "💰 CSG/CRDS", a: Math.round(b * SASU_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

export const mkMicro = (ca: number): CotisItem[] => [
  { n: "🏥 Maladie", a: Math.round(ca * MICRO_DETAIL.maladie), c: "✅" },
  { n: "👴 Retraite", a: Math.round(ca * MICRO_DETAIL.retraite), c: "⚠️" },
  { n: "💰 CSG/CRDS", a: Math.round(ca * MICRO_DETAIL.csgCrds), c: "—" },
  { n: "💼 Chômage", a: 0, c: "❌" },
];

export const MICRO_TAUX_LABEL = (MICRO_BNC_TAUX * 100).toFixed(1).replace(".", ",") + "% du CA";
