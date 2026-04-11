"use client";

import { useState, useMemo } from "react";
import {
  MICRO_CAP, IS_SEUIL_REDUIT, IS_SEUIL_PLF2026,
  TNS_COEFF, CHARGES_FIXES_SOCIETE, SASU_COEFF_NET,
} from "@/lib/fiscal";
import {
  simMicro, simTNS_A, simTNS_B, simSASU_A, simSASU_B, simHolding,
  retInfo, mkTNS, mkSASU, mkMicro,
  fmt, MICRO_TAUX_LABEL,
} from "@/lib/engine";
import type { Sim, Line, CotisItem, RetResult, StructConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Header } from "@/components/layout/header";
import { Sidebar, MobileControls } from "@/components/layout/sidebar";
import { SankeyOverview } from "@/components/comparison/sankey-overview";
import { FlowTab } from "@/components/detail/flow-tab";
import { simToSankey } from "@/lib/sankey";
import { User, FileText, Building2, Landmark, Layers } from "lucide-react";
import type { ElementType } from "react";

const STRUCT_ICONS: Record<string, ElementType> = {
  micro: User,
  ei: FileText,
  eurl: Building2,
  sasu: Landmark,
  holding: Layers,
};

// --- Primitives UI ---
function Bar({ v, mx, c }: { v: number; mx: number; c: string }) {
  const pct = mx > 0 ? Math.min(Math.max(v / mx * 100, 0), 100) : 0;
  return (
    <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + "%", background: c }} />
    </div>
  );
}

function LI({ d }: { d: Line }) {
  const colorClass = d.t === "s" ? "text-text-primary" : d.t === "c" ? "text-negative" : d.t === "x" ? "text-tax" : "text-text-secondary";
  return (
    <div className="flex justify-between py-1.5 border-b border-border-subtle text-sm">
      <span className={cn(colorClass, d.t === "s" && "font-semibold")}>{d.l}</span>
      <span className={cn(d.a < 0 ? "text-negative" : colorClass, d.t === "s" && "font-semibold", "whitespace-nowrap ml-3 font-mono")}>
        {d.a >= 0 ? fmt(d.a) : "- " + fmt(Math.abs(d.a))}
      </span>
    </div>
  );
}

function BarsViz({ items, mx }: { items: [string, number, string][]; mx: number }) {
  return (
    <div className="space-y-2">
      {items.map(([l, v, c], i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: c }}>{l}</span>
            <span style={{ color: c }} className="font-semibold font-mono">{fmt(v)}</span>
          </div>
          <Bar v={v} mx={mx} c={c} />
        </div>
      ))}
    </div>
  );
}

function CotisT({ items }: { items: CotisItem[] }) {
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="text-sm font-semibold mb-3 text-text-primary">Cotisations détaillées</div>
      <table className="w-full text-sm">
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-border-subtle last:border-0">
              <td className="py-2 text-text-secondary">{it.n}</td>
              <td className={cn("py-2 font-mono font-medium text-right", it.a > 0 ? "text-negative" : "text-text-tertiary")}>
                {it.a > 0 ? fmt(it.a) : "—"}
              </td>
              <td className="py-2 text-right text-xs w-8">
                <span className={it.c.startsWith("❌") ? "text-negative" : it.c.startsWith("⚠") ? "text-tax" : "text-positive"}>
                  {it.c}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RetB({ info }: { info: RetResult }) {
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle text-sm">
      <div className="text-text-secondary">
        Retraite — Pension : <strong className="text-text-primary font-mono">~{fmt(info.pen)}/mois</strong>
        {" · "}Trimestres/an : <strong className={info.tr >= 4 ? "text-positive" : "text-tax"}>{info.tr}/4</strong>
      </div>
      <p className="text-[11px] text-text-tertiary mt-1">Carrière complète = 43 ans (172 trimestres)</p>
    </div>
  );
}

function CapUsage({ type }: { type: string }) {
  const data: Record<string, { t: string; i: string[][] }> = {
    eurl: { t: "Capital dans la société (EURL)", i: [["Embaucher / Matériel", "Investissement productif"], ["Dividendes futurs", "Soumis TNS > 10% capital"], ["Bourse", "Risque requalification"]] },
    sasu: { t: "Capital dans la société (SASU)", i: [["Embaucher / Matériel", "Investissement productif"], ["Dividendes futurs", "Flat tax 30% SANS cotisations"], ["Bourse", "Change l'objet social"]] },
    holding: { t: "Capital dans la société (Holding)", i: [["Bourse / ETF", "Investir à l'IS"], ["Crédit Lombard", "Emprunter sans vendre"], ["SCI / Immobilier", "Via la holding"], ["Prêt CCA", "Remboursement non imposé"], ["Levier fiscal", "IS 15-25% vs IR 30-45%"]] },
    ei: { t: "Capital dans l'EI (IS)", i: [["Matériel / Trésorerie", "Investissement"], ["Patrimoine", "Séparé depuis 2022 mais pas de personnalité morale"]] },
  };
  const d = data[type];
  if (!d) return null;
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="text-sm font-semibold text-positive mb-3">{d.t}</div>
      <div className="space-y-1.5">
        {d.i.map((it, i) => (
          <div key={i} className="text-sm">
            <span className="text-text-primary font-medium">{it[0]}</span>
            <span className="text-text-tertiary">{" — " + it[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main ---
export default function App() {
  const [ca, setCa] = useState(100000);
  const [parts, setParts] = useState(1);
  const [sel, setSel] = useState<string>("micro");
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

  const structs: StructConfig[] = [
    { id: "micro", name: "Micro", icon: "micro", color: "#2563eb", accent: "#60a5fa", noB: true },
    { id: "ei", name: "EI " + regEI, icon: "ei", color: "#0891b2", accent: "#2dd4bf", noB: !eiCanB },
    { id: "eurl", name: "EURL " + regEURL, icon: "eurl", color: "#059669", accent: "#34d399", noB: !eurlCanB },
    { id: "sasu", name: "SASU " + regSASU, icon: "sasu", color: "#7c3aed", accent: "#a78bfa", noB: !sasuCanB },
    { id: "holding", name: "SASU+Holding", icon: "holding", color: "#d97706", accent: "#fbbf24", noB: false },
  ];

  const openD = (id: string) => { setSel(id); setTab("overview"); };

  const st = structs.find(s => s.id === sel)!;
  const isB = gm === "B" && !st.noB;

  // Compute current sim data
  let sim: Sim, cotisItems: CotisItem[], retData: RetResult;
  if (sel === "micro") {
    sim = S.micro; cotisItems = mkMicro(mCA); retData = retInfo("micro", sim.rev, 0);
  } else if (sel === "ei") {
    sim = (eiCanB && isB && S.ei_B) ? S.ei_B : S.ei_A;
    cotisItems = mkTNS(isB && eiCanB ? salB : sim.nr); retData = retInfo("tns", isB && eiCanB ? salB : sim.nr, 0);
  } else if (sel === "eurl") {
    sim = (eurlCanB && isB && S.eurl_B) ? S.eurl_B : S.eurl_A;
    cotisItems = mkTNS(isB && eurlCanB ? salB : sim.nr); retData = retInfo("tns", isB && eurlCanB ? salB : sim.nr, 0);
  } else if (sel === "sasu") {
    sim = (sasuCanB && isB && S.sasu_B) ? S.sasu_B : S.sasu_A;
    cotisItems = mkSASU(sim.brut || Math.round((isB && sasuCanB ? salB : sim.nAv || 20400) / SASU_COEFF_NET));
    retData = retInfo("salarie", sim.nAv || salB, sim.brut);
  } else {
    sim = isB ? S.hold_B : S.hold_A;
    cotisItems = mkTNS(isB ? salB : (sim.nr || salB)); retData = retInfo("tns", isB ? salB : (sim.nr || salB), 0);
  }

  const sankeyData = simToSankey(sim, sel, isB);

  const tabItems = [
    { k: "overview", l: "Synthèse" },
    { k: "sankey", l: "Répartition" },
    { k: "flow", l: "Flux" },
    { k: "cotis", l: "Cotisations" },
  ];
  if (isB) tabItems.push({ k: "capital", l: "Capital" });

  return (
    <div className="flex flex-col min-h-screen">
      <Header structs={structs} sel={sel} onSelect={openD} getData={getData} icons={STRUCT_ICONS} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          ca={ca} setCa={setCa} parts={parts} setParts={setParts}
          gm={gm} setGm={setGm} isSeuilEtendu={isSeuilEtendu} setIsSeuilEtendu={setIsSeuilEtendu}
          isCapped={isCapped} sel={sel}
          regEI={regEI} setRegEI={setRegEI} regEURL={regEURL} setRegEURL={setRegEURL}
          regSASU={regSASU} setRegSASU={setRegSASU}
          salB={salB} setSalB={setSalB} mandatM={mandatM} setMandatM={setMandatM}
          maxSalB={maxSalB} maxMandat={maxMandat} isB={isB}
        />

        <MobileControls
          ca={ca} setCa={setCa} parts={parts} setParts={setParts}
          gm={gm} setGm={setGm} isSeuilEtendu={isSeuilEtendu} setIsSeuilEtendu={setIsSeuilEtendu}
          isCapped={isCapped}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto">
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  {(() => { const Icon = STRUCT_ICONS[st.id]; return Icon ? <Icon size={20} className="text-text-secondary" /> : null; })()}
                  {st.name}
                  <span className="text-sm text-text-tertiary font-normal">
                    Mode {st.noB ? "A" : gm}
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-text-primary">{fmt(sim.net)}</div>
                <div className="text-xs text-text-tertiary">{fmt(Math.round(sim.net / 12))}/mois</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-border-subtle mb-6">
              {tabItems.map(t => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                    tab === t.k
                      ? "text-text-primary border-text-primary"
                      : "text-text-tertiary border-transparent hover:text-text-secondary"
                  )}
                >
                  {t.l}
                </button>
              ))}
            </div>

            {/* Content */}
            {tab === "overview" && (
              <div>
                {sel === "holding" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-1.5"><Landmark size={14} /> SASU</div>
                      {sim.sasuL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-1.5"><Layers size={14} /> Holding</div>
                      {sim.holdL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    {sim.lines.map((d: Line, i: number) => <LI key={i} d={d} />)}
                    <div className="flex justify-between py-3 border-t border-text-primary/20 mt-2 text-lg font-bold text-text-primary">
                      <span>Net</span>
                      <span className="font-mono">{fmt(sim.net)}</span>
                    </div>
                    {sim.ret > 0 && (
                      <div className="flex justify-between py-2 text-sm font-bold text-positive">
                        <span>Dans la société</span>
                        <span className="font-mono">{fmt(sim.ret)}</span>
                      </div>
                    )}
                  </div>
                  <BarsViz
                    items={[
                      ["URSSAF", sim.co, "#f43f5e"],
                      [sim.is ? "IS + IR" : "IR", (sim.is || 0) + sim.ir, "#f59e0b"],
                      ["Net perso", sim.net, "#fafafa"],
                      ...(sim.ret > 0 ? [["Capitalisé" as string, sim.ret as number, "#22c55e" as string] as [string, number, string]] : []),
                    ]}
                    mx={ca}
                  />
                </div>
              </div>
            )}
            {tab === "sankey" && <SankeyOverview data={sankeyData} accent={st.accent} />}
            {tab === "flow" && (
              <FlowTab
                sel={sel} sim={sim} isB={isB} accent={st.accent}
                regEI={regEI} regEURL={regEURL} regSASU={regSASU}
                eiCanB={eiCanB} eurlCanB={eurlCanB} sasuCanB={sasuCanB}
              />
            )}
            {tab === "cotis" && (
              <div className="space-y-4">
                <CotisT items={cotisItems} />
                <RetB info={retData} />
              </div>
            )}
            {tab === "capital" && isB && <CapUsage type={sel === "holding" ? "holding" : sel} />}
          </div>
        </main>
      </div>
    </div>
  );
}
