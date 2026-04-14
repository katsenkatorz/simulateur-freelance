export interface Line {
  l: string;
  a: number;
  t: "n" | "s" | "c" | "x";
}

export interface ISResult {
  is15: number;
  is25: number;
  total: number;
}

export interface CotisItem {
  n: string;
  a: number;
  c: string;
}

export interface RetResult {
  pen: number;
  tr: number;
}

export interface SimBase {
  ca: number;
  co: number;
  ir: number;
  net: number;
  ret: number;
  lines: Line[];
}

export interface SimMicro extends SimBase {
  kind: 'micro';
  rev: number;
}

export interface SimTNS_A extends SimBase {
  kind: 'tns_a';
  nr: number;
  cotisOnly: number;
}

export interface SimTNS_B extends SimBase {
  kind: 'tns_b';
  nr: number;
  cotisOnly: number;
  is: number;
  isD: ISResult;
  profit: number;
}

export interface SimSASU_A extends SimBase {
  kind: 'sasu_a';
  brut: number;
  nAv: number;
}

export interface SimSASU_B extends SimBase {
  kind: 'sasu_b';
  brut: number;
  is: number;
  isD: ISResult;
  profit: number;
}

export interface SimHolding extends SimBase {
  kind: 'holding_a' | 'holding_b';
  nr: number;
  dispo: number;
  divBrut: number;
  qp: number;
  mandatAn: number;
  resultSASU: number;
  isSASU: ISResult;
  sasuL: Line[];
  holdL: Line[];
  is?: number;
  isH?: ISResult;
  taxableIncome?: number;
  profitH?: number;
}

export interface SimCDI extends SimBase {
  kind: 'cdi';
  brut: number;
  coutEmployeur: number;
  patronal: number;
  salarial: number;
  netAvantIR: number;
  tr: number;
}

export interface SimPortage extends SimBase {
  kind: 'portage';
  brut: number;
  frais: number;
  fraisGestion: number;
  patronal: number;
  salarial: number;
  netAvantIR: number;
}

export type Sim = SimMicro | SimTNS_A | SimTNS_B | SimSASU_A | SimSASU_B | SimHolding | SimCDI | SimPortage;

export interface StructConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
  noB: boolean;
}
