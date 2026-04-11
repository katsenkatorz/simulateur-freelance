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
  rev: number;
}

export interface SimTNS_A extends SimBase {
  nr: number;
  cotisOnly: number;
}

export interface SimTNS_B extends SimBase {
  nr: number;
  cotisOnly: number;
  is: number;
  isD: ISResult;
  profit: number;
}

export interface SimSASU_A extends SimBase {
  brut: number;
  nAv: number;
}

export interface SimSASU_B extends SimBase {
  brut: number;
  is: number;
  isD: ISResult;
  profit: number;
}

export interface SimHolding extends SimBase {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sim = any;

export interface StructConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
  noB: boolean;
}
