"use client";

import { useState, useMemo } from "react";
import {
  MICRO_CAP, IS_SEUIL_REDUIT, IS_SEUIL_PLF2026,
  TNS_COEFF, CHARGES_FIXES_SOCIETE, SASU_COEFF_NET,
} from "@/lib/fiscal";
import {
  simMicro, simTNS_A, simTNS_B, simSASU_A, simSASU_B, simHolding,
  retInfo, mkTNS, mkSASU, mkMicro,
  fmt, isLabel, MICRO_TAUX_LABEL,
} from "@/lib/engine";
import type { Sim, Line, CotisItem, RetResult, StructConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Sidebar } from "@/components/layout/sidebar";
import { StructureCard } from "@/components/comparison/structure-card";
import { SankeyOverview } from "@/components/comparison/sankey-overview";
import { FlowTab } from "@/components/detail/flow-tab";
import { simToSankey } from "@/lib/sankey";

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

function CotisT({ items, accent }: { items: CotisItem[]; accent: string }) {
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="text-sm font-semibold mb-3" style={{ color: accent }}>Cotisations détaillées</div>
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
        👴 Retraite — Pension : <strong className="text-text-primary font-mono">~{fmt(info.pen)}/mois</strong>
        {" · "}Trimestres/an : <strong className={info.tr >= 4 ? "text-positive" : "text-tax"}>{info.tr}/4</strong>
      </div>
      <p className="text-[11px] text-text-tertiary mt-1">Carrière complète = 43 ans (172 trimestres)</p>
    </div>
  );
}

function CapUsage({ type }: { type: string }) {
  const data: Record<string, { t: string; i: string[][] }> = {
    eurl: { t: "Capital dans la société (EURL)", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Soumis TNS > 10% capital"], ["⚠️ Bourse", "Risque requalification"]] },
    sasu: { t: "Capital dans la société (SASU)", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Flat tax 30% SANS cotisations"], ["⚠️ Bourse", "Change l'objet social"]] },
    holding: { t: "Capital dans la société (Holding)", i: [["✅ Bourse / ETF", "Investir à l'IS"], ["✅ Crédit Lombard", "Emprunter sans vendre"], ["✅ SCI / Immobilier", "Via la holding"], ["✅ Prêt CCA", "Remboursement non imposé"], ["🔥 Levier fiscal", "IS 15-25% vs IR 30-45%"]] },
    ei: { t: "Capital dans l'EI (IS)", i: [["✅ Matériel / Trésorerie", "Investissement"], ["⚠️ Patrimoine", "Séparé depuis 2022 mais pas de personnalité morale"]] },
  };
  const d = data[type];
  if (!d) return null;
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="text-sm font-semibold text-positive mb-3">{d.t}</div>
      <div className="space-y-1.5">
        {d.i.map((it, i) => (
          <div key={i} className="text-sm">
            <strong className={it[0].startsWith("❌") ? "text-negative" : it[0].startsWith("⚠") ? "text-tax" : it[0].startsWith("🔥") ? "text-holding" : "text-text-primary"}>
              {it[0]}
            </strong>
            <span className="text-text-tertiary">{" — " + it[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: {
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-bg-primary rounded-lg p-0.5 border border-border-subtle">
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
            value === o.v
              ? "bg-accent text-white shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

// --- Main ---
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

  const structs: StructConfig[] = [
    { id: "micro", name: "Micro", icon: "🧑‍💻", color: "#2563eb", accent: "#60a5fa", noB: true },
    { id: "ei", name: "EI " + regEI, icon: "📋", color: "#0891b2", accent: "#2dd4bf", noB: !eiCanB },
    { id: "eurl", name: "EURL " + regEURL, icon: "🏢", color: "#059669", accent: "#34d399", noB: !eurlCanB },
    { id: "sasu", name: "SASU " + regSASU, icon: "🏛️", color: "#7c3aed", accent: "#a78bfa", noB: !sasuCanB },
    { id: "holding", name: "SASU+Holding", icon: "🏗️", color: "#d97706", accent: "#fbbf24", noB: false },
  ];

  const openD = (id: string) => { setSel(sel === id ? null : id); setTab("overview"); };

  function renderDetail() {
    if (!sel) return null;
    const st = structs.find(s => s.id === sel)!;
    const isB = gm === "B" && !st.noB;
    let sim: Sim, cotisItems: CotisItem[], retData: RetResult, regToggle: React.ReactNode = null;

    if (sel === "micro") {
      sim = S.micro; cotisItems = mkMicro(mCA); retData = retInfo("micro", sim.rev, 0);
    } else if (sel === "ei") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR" }, { v: "IS", l: "IS (depuis 2022)" }]} value={regEI} onChange={setRegEI} />;
      sim = (eiCanB && isB && S.ei_B) ? S.ei_B : S.ei_A;
      cotisItems = mkTNS(isB && eiCanB ? salB : sim.nr); retData = retInfo("tns", isB && eiCanB ? salB : sim.nr, 0);
    } else if (sel === "eurl") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR (transparent)" }, { v: "IS", l: "IS" }]} value={regEURL} onChange={setRegEURL} />;
      sim = (eurlCanB && isB && S.eurl_B) ? S.eurl_B : S.eurl_A;
      cotisItems = mkTNS(isB && eurlCanB ? salB : sim.nr); retData = retInfo("tns", isB && eurlCanB ? salB : sim.nr, 0);
    } else if (sel === "sasu") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR (5 ans max)" }, { v: "IS", l: "IS" }]} value={regSASU} onChange={setRegSASU} />;
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
      { k: "flow", l: "Flux détaillé" },
      { k: "cotis", l: "Cotisations" },
    ];
    if (isB) tabItems.push({ k: "capital", l: "Capital" });

    return (
      <div className="mt-6 border border-border-default rounded-xl overflow-hidden bg-bg-card">
        {/* Header */}
        <div className="px-6 pt-5 pb-0 border-b border-border-subtle" style={{ borderBottomColor: st.accent + "30" }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-text-primary">
              <span style={{ color: st.accent }}>{st.icon} {st.name}</span>
              <span className="text-sm text-text-tertiary font-normal ml-2">
                Mode {st.noB ? "A" : gm}{!st.noB && gm === "B" && " · Capitalise"}
              </span>
            </h2>
            {regToggle}
          </div>

          {sel === "holding" && (
            <div className="pb-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-text-secondary">Rémun. mandat présidence</span>
                <span className="text-base font-bold font-mono text-text-primary">
                  {fmt(mandatM)}<span className="text-text-tertiary font-normal text-xs">/mois</span>
                </span>
              </div>
              <input type="range" min={1000} max={Math.max(maxMandat, 2000)} step={500} value={mandatM} onChange={e => setMandatM(+e.target.value)} className="w-full cursor-pointer accent-sasu" />
            </div>
          )}

          {isB && (
            <div className="pb-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-text-secondary">Salaire net gérant</span>
                <span className="text-base font-bold font-mono text-text-primary">
                  {fmt(Math.round(salB / 12))}<span className="text-text-tertiary font-normal text-xs">/mois</span>
                </span>
              </div>
              <input type="range" min={6000} max={maxSalB} step={1200} value={salB} onChange={e => setSalB(+e.target.value)} className="w-full cursor-pointer" style={{ accentColor: st.accent }} />
            </div>
          )}

          {!st.noB && gm === "B" && ((sel === "ei" && regEI === "IR") || (sel === "eurl" && regEURL === "IR") || (sel === "sasu" && regSASU === "IR")) && (
            <div className="py-2 px-3 bg-tax/5 border border-tax/20 rounded-lg text-xs text-tax mb-3">
              ⚠️ À l&apos;IR, pas de capitalisation — bénéfice imposé directement. Mode A forcé.
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {tabItems.map(t => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  "px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                  tab === t.k
                    ? "text-text-primary border-accent"
                    : "text-text-tertiary border-transparent hover:text-text-secondary"
                )}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === "overview" && (
            <div>
              {sel === "holding" && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-sasu mb-2">🏛️ SASU</div>
                    {sim.sasuL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-holding mb-2">🏗️ Holding</div>
                    {sim.holdL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {sim.lines.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  <div className="flex justify-between py-3 border-t-2 mt-2 text-lg font-bold" style={{ borderColor: st.accent, color: st.accent }}>
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
                    ["Net perso", sim.net, st.accent],
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
              sel={sel}
              sim={sim}
              isB={isB}
              accent={st.accent}
              regEI={regEI}
              regEURL={regEURL}
              regSASU={regSASU}
              eiCanB={eiCanB}
              eurlCanB={eurlCanB}
              sasuCanB={sasuCanB}
            />
          )}
          {tab === "cotis" && (
            <div className="space-y-4">
              <CotisT items={cotisItems} accent={st.accent} />
              <RetB info={retData} />
            </div>
          )}
          {tab === "capital" && isB && <CapUsage type={sel === "holding" ? "holding" : sel} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        ca={ca} setCa={setCa}
        parts={parts} setParts={setParts}
        gm={gm} setGm={setGm}
        isSeuilEtendu={isSeuilEtendu} setIsSeuilEtendu={setIsSeuilEtendu}
        isCapped={isCapped}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto">
          {/* Comparison cards */}
          <div className="grid grid-cols-5 gap-3">
            {structs.map(st => {
              const d = getData(st.id);
              const showB = gm === "B" && !st.noB;
              return (
                <StructureCard
                  key={st.id}
                  struct={st}
                  net={d.net}
                  ret={d.ret}
                  ca={d.dCA}
                  isB={showB}
                  selected={sel === st.id}
                  onClick={() => openD(st.id)}
                />
              );
            })}
          </div>

          {/* Detail panel */}
          {renderDetail()}
        </div>
      </main>
    </div>
  );
}
