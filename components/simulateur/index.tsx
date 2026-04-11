"use client";

import { useState, useMemo } from "react";
import {
  MICRO_CAP, IS_SEUIL_REDUIT, IS_SEUIL_PLF2026,
  TNS_COEFF, CHARGES_FIXES_SOCIETE, SASU_COEFF_NET,
  MICRO_BNC_TAUX,
} from "@/lib/fiscal";
import {
  simMicro, simTNS_A, simTNS_B, simSASU_A, simSASU_B, simHolding,
  retInfo, mkTNS, mkSASU, mkMicro,
  fmt, isLabel, MICRO_TAUX_LABEL,
} from "@/lib/engine";
import type { Sim, Line, CotisItem, RetResult, StructConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";

import { TrendingUp, Users, Target, Info } from "lucide-react";

import { FlowSimple } from "@/components/flow/flow-simple";
import { FlowSplit } from "@/components/flow/flow-split";
import { FlowHoldingA } from "@/components/flow/flow-holding-a";
import { FlowHoldingB } from "@/components/flow/flow-holding-b";

// --- UI Primitives ---
function Bar({ v, mx, c }: { v: number; mx: number; c: string }) {
  const pct = mx > 0 ? Math.min(Math.max(v / mx * 100, 0), 100) : 0;
  return (
    <div className="w-full h-2 bg-bg-input rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-400" style={{ width: pct + "%", background: c }} />
    </div>
  );
}

function LI({ d }: { d: Line }) {
  const c = d.t === "s" ? "text-white" : d.t === "c" ? "text-charge" : d.t === "x" ? "text-tax" : "text-text-primary";
  return (
    <div className="flex justify-between py-1 border-b border-[#1a1a3e] text-sm">
      <span className={cn(c, d.t === "s" && "font-semibold")}>{d.l}</span>
      <span className={cn(d.a < 0 ? "text-charge" : c, d.t === "s" && "font-semibold", "whitespace-nowrap ml-2")}>
        {d.a >= 0 ? fmt(d.a) : "- " + fmt(Math.abs(d.a))}
      </span>
    </div>
  );
}

function BarsViz({ items, mx }: { items: [string, number, string][]; mx: number }) {
  return (
    <div>
      {items.map(([l, v, c], i) => (
        <div key={i} className="mb-1.5">
          <div className="flex justify-between text-xs mb-0.5">
            <span style={{ color: c }}>{l}</span>
            <span style={{ color: c }} className="font-semibold">{fmt(v)}</span>
          </div>
          <Bar v={v} mx={mx} c={c} />
        </div>
      ))}
    </div>
  );
}

function CotisT({ items, accent }: { items: CotisItem[]; accent: string }) {
  return (
    <div className="p-3 bg-bg-primary rounded-xl">
      <div className="text-sm font-semibold mb-1.5" style={{ color: accent }}>🔍 Cotisations</div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="py-1 border-b border-bg-detail text-text-muted">{it.n}</td>
              <td className={cn("py-1 border-b border-bg-detail font-medium text-right w-[70px]", it.a > 0 ? "text-charge" : "text-text-dim")}>
                {it.a > 0 ? fmt(it.a) : "—"}
              </td>
              <td className="py-1 border-b border-bg-detail text-xs">
                <span className={it.c.startsWith("❌") ? "text-charge" : it.c.startsWith("⚠") ? "text-tax" : "text-capital"}>
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
    <div className="p-2.5 bg-bg-primary rounded-xl text-sm text-text-muted">
      {"👴 Retraite — Pension : "}
      <strong className="text-white">{"~" + fmt(info.pen) + "/mois"}</strong>
      {" · Trimestres/an : "}
      <strong className={info.tr >= 4 ? "text-capital" : "text-tax"}>{info.tr + "/4"}</strong>
      <br />
      <span className="text-text-dim">Carrière complète = 43 ans (172 trimestres, né(e) après 1973)</span>
    </div>
  );
}

function CapUsage({ type }: { type: string }) {
  const data: Record<string, { t: string; c: string; i: string[][] }> = {
    eurl: { t: "💡 Capital dans la société (EURL)", c: "#34d399", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Soumis TNS > 10% capital"], ["⚠️ Bourse", "Risque requalification"]] },
    sasu: { t: "💡 Capital dans la société (SASU)", c: "#34d399", i: [["✅ Embaucher / Matériel", "Investissement productif"], ["✅ Dividendes futurs", "Flat tax 30% SANS cotisations"], ["⚠️ Bourse", "Change l'objet social"]] },
    holding: { t: "💡 Capital dans la société (Holding)", c: "#34d399", i: [["✅ Bourse / ETF", "Investir à l'IS"], ["✅ Crédit Lombard", "Emprunter sans vendre"], ["✅ SCI / Immobilier", "Via la holding"], ["✅ Prêt CCA", "Remboursement non imposé"], ["🔥 Levier fiscal", "IS 15-25% vs IR 30-45%"]] },
    ei: { t: "💡 Capital dans l'EI (IS)", c: "#34d399", i: [["✅ Matériel / Trésorerie", "Investissement"], ["⚠️ Patrimoine", "Séparé depuis 2022 mais pas de personnalité morale"]] },
  };
  const d = data[type];
  if (!d) return null;
  return (
    <div className="p-3 bg-bg-primary rounded-xl">
      <div className="text-sm font-semibold mb-1.5" style={{ color: d.c }}>{d.t}</div>
      {d.i.map((it, i) => (
        <div key={i} className="text-sm mb-0.5" style={{ color: it[0].startsWith("❌") ? "#ff6b6b" : it[0].startsWith("⚠") ? "#ffa94d" : it[0].startsWith("🔥") ? "#fbbf24" : "#ccc" }}>
          <strong>{it[0]}</strong>{" — "}<span className="text-text-dim">{it[1]}</span>
        </div>
      ))}
    </div>
  );
}

function ToggleGroup({ options, value, onChange, size = "normal" }: {
  options: { v: string; l: string; c?: string }[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "normal";
}) {
  return (
    <div className="inline-flex bg-bg-input rounded-md p-0.5 gap-0.5">
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-md border-none cursor-pointer font-semibold transition-all duration-200",
            size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[13px]",
            value === o.v ? "text-bg-primary shadow-sm" : "text-text-dim hover:text-text-muted"
          )}
          style={value === o.v ? { background: o.c || "#c084fc" } : undefined}
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
    { id: "ei", name: "EI " + regEI, icon: "📋", color: "#0891b2", accent: "#22d3ee", noB: !eiCanB },
    { id: "eurl", name: "EURL " + regEURL, icon: "🏢", color: "#059669", accent: "#34d399", noB: !eurlCanB },
    { id: "sasu", name: "SASU " + regSASU, icon: "🏛️", color: "#9333ea", accent: "#c084fc", noB: !sasuCanB },
    { id: "holding", name: "SASU+Holding", icon: "🐟", color: "#d97706", accent: "#fbbf24", noB: false },
  ];

  const openD = (id: string) => { setSel(sel === id ? null : id); setTab("overview"); };

  function renderDetail() {
    if (!sel) return null;
    const st = structs.find(s => s.id === sel)!;
    const isB = gm === "B" && !st.noB;
    let sim: Sim, cotisItems: CotisItem[], retData: RetResult, flowEl: React.ReactNode, regToggle: React.ReactNode = null;

    if (sel === "micro") {
      sim = S.micro; cotisItems = mkMicro(mCA); retData = retInfo("micro", sim.rev, 0);
      flowEl = <FlowSimple sim={sim} accent="#60a5fa" icon="🧑‍💻" name="Micro" chargeLabel={MICRO_TAUX_LABEL} />;
    } else if (sel === "ei") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR", c: "#22d3ee" }, { v: "IS", l: "IS (depuis 2022)", c: "#f59e0b" }]} value={regEI} onChange={setRegEI} />;
      sim = (eiCanB && isB && S.ei_B) ? S.ei_B : S.ei_A;
      cotisItems = mkTNS(isB && eiCanB ? salB : sim.nr); retData = retInfo("tns", isB && eiCanB ? salB : sim.nr, 0);
      flowEl = (eiCanB && isB) ? <FlowSplit sim={sim} accent="#22d3ee" icon="📋" name="EI IS" capSub="Matériel · Trésorerie" /> : <FlowSimple sim={sim} accent="#22d3ee" icon="📋" name={"EI " + regEI} chargeLabel="TNS ~43%" />;
    } else if (sel === "eurl") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR (transparent)", c: "#34d399" }, { v: "IS", l: "IS", c: "#f59e0b" }]} value={regEURL} onChange={setRegEURL} />;
      sim = (eurlCanB && isB && S.eurl_B) ? S.eurl_B : S.eurl_A;
      cotisItems = mkTNS(isB && eurlCanB ? salB : sim.nr); retData = retInfo("tns", isB && eurlCanB ? salB : sim.nr, 0);
      flowEl = (eurlCanB && isB) ? <FlowSplit sim={sim} accent="#34d399" icon="🏢" name="EURL IS" capSub="Embauche · Matériel" /> : <FlowSimple sim={sim} accent="#34d399" icon="🏢" name={"EURL " + regEURL} chargeLabel="TNS ~43%" />;
    } else if (sel === "sasu") {
      regToggle = <ToggleGroup options={[{ v: "IR", l: "IR (5 ans max)", c: "#c084fc" }, { v: "IS", l: "IS", c: "#f59e0b" }]} value={regSASU} onChange={setRegSASU} />;
      sim = (sasuCanB && isB && S.sasu_B) ? S.sasu_B : S.sasu_A;
      cotisItems = mkSASU(sim.brut || Math.round((isB && sasuCanB ? salB : sim.nAv || 20400) / SASU_COEFF_NET));
      retData = retInfo("salarie", sim.nAv || salB, sim.brut);
      flowEl = (sasuCanB && isB) ? <FlowSplit sim={{ ...sim, cotisOnly: sim.co - CHARGES_FIXES_SOCIETE }} accent="#c084fc" icon="🏛️" name="SASU IS" capSub="Div. flat tax 30%" /> : <FlowSimple sim={sim} accent="#c084fc" icon="🏛️" name={"SASU " + regSASU} chargeLabel={regSASU === "IS" ? "~77% du brut" : "~77% (transparent)"} />;
    } else {
      sim = isB ? S.hold_B : S.hold_A;
      cotisItems = mkTNS(isB ? salB : (sim.nr || salB)); retData = retInfo("tns", isB ? salB : (sim.nr || salB), 0);
      flowEl = isB ? <FlowHoldingB sim={sim} /> : <FlowHoldingA sim={sim} />;
    }

    const tabItems = [
      { k: "overview", l: "Synthèse", icon: "📋" },
      { k: "flow", l: "Flux", icon: "📊" },
      { k: "cotis", l: "Cotisations", icon: "🔍" },
    ];
    if (isB) tabItems.push({ k: "capital", l: "Capital", icon: "💡" });

    return (
      <div className="border-2 overflow-hidden mb-3.5 bg-bg-card rounded-xl" style={{ borderColor: st.color + "40" }}>
        <div className="px-4 pt-3.5 pb-0" style={{ background: st.color + "06" }}>
          <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
            <h2 className="text-xl font-bold m-0" style={{ color: st.accent }}>
              {st.icon + " " + st.name}
              <span className="text-[13px] text-text-dim font-normal">
                {" · Mode " + (st.noB ? "A" : gm)}
                {regToggle && !st.noB && gm === "B" && " · Capitalise"}
              </span>
            </h2>
            {regToggle && <div>{regToggle}</div>}
          </div>

          {sel === "micro" && isCapped && (
            <div className="flex gap-1.5 mb-1.5">
              <button onClick={e => { e.stopPropagation(); setMicroTab("hypo"); }} className={cn("px-2.5 py-1 rounded-md border-none cursor-pointer font-semibold text-[10px]", microTab === "hypo" ? "bg-solde text-bg-primary" : "bg-bg-input text-text-muted")}>
                {fmt(ca) + " — Hypothétique"}
              </button>
              <button onClick={e => { e.stopPropagation(); setMicroTab("real"); setCa(MICRO_CAP); }} className={cn("px-2.5 py-1 rounded-md border-none cursor-pointer font-semibold text-[10px]", microTab === "real" ? "bg-micro text-white" : "bg-bg-input text-text-muted")}>
                {fmt(MICRO_CAP) + " — Plafond réel"}
              </button>
            </div>
          )}

          {sel === "holding" && (
            <div className="py-1.5">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-sm text-text-muted">🏛️ Rémun. mandat présidence</span>
                <span className="text-lg font-bold font-mono" style={{ color: "#c084fc" }}>
                  {fmt(mandatM) + "/mois"}
                  <span className="text-[11px] text-text-dim font-normal">{" = " + fmt(mandatM * 12) + "/an"}</span>
                </span>
              </div>
              <input type="range" min={1000} max={Math.max(maxMandat, 2000)} step={500} value={mandatM} onChange={e => setMandatM(+e.target.value)} className="w-full cursor-pointer accent-sasu" />
            </div>
          )}

          {isB && (
            <div className="py-1.5">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-sm text-text-muted">💰 Salaire net gérant</span>
                <span className="text-lg font-bold font-mono" style={{ color: st.accent }}>
                  {fmt(Math.round(salB / 12)) + "/mois"}
                  <span className="text-[11px] text-text-dim font-normal">{" = " + fmt(salB) + "/an"}</span>
                </span>
              </div>
              <input type="range" min={6000} max={maxSalB} step={1200} value={salB} onChange={e => setSalB(+e.target.value)} className="w-full cursor-pointer" style={{ accentColor: st.accent }} />
            </div>
          )}

          {!st.noB && gm === "B" && ((sel === "ei" && regEI === "IR") || (sel === "eurl" && regEURL === "IR") || (sel === "sasu" && regSASU === "IR")) && (
            <div className="py-1.5 px-2.5 bg-tax/5 border border-tax/20 rounded-md text-xs text-tax mb-1.5">
              ⚠️ À l&apos;IR, pas de capitalisation possible — le bénéfice est imposé directement à l&apos;IR. Mode A forcé.
            </div>
          )}

          <div className="flex gap-0.5 mt-1 border-b border-[#1a1a3e]">
            {tabItems.map(t => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-bold border-b-2 border-transparent bg-transparent cursor-pointer transition-colors",
                  tab === t.k ? "text-white" : "text-text-dim hover:text-text-muted"
                )}
                style={tab === t.k ? { borderBottomColor: st.accent } : undefined}
              >
                {t.icon + " " + t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {tab === "overview" && (
            <div>
              {sel === "holding" && (
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <div>
                    <div className="text-sm font-semibold text-sasu mb-1">🏛️ SASU</div>
                    {sim.sasuL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-holding mb-1">🏢 Holding</div>
                    {sim.holdL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  {sim.lines.map((d: Line, i: number) => <LI key={i} d={d} />)}
                  <div className="flex justify-between py-2 border-t-2 mt-1 text-lg font-bold" style={{ borderColor: st.accent, color: st.accent }}>
                    <span>💰 Net</span><span>{fmt(sim.net)}</span>
                  </div>
                  {sim.ret > 0 && (
                    <div className="flex justify-between py-1 text-[15px] font-bold text-capital">
                      <span>📈 Dans la société</span><span>{fmt(sim.ret)}</span>
                    </div>
                  )}
                </div>
                <BarsViz
                  items={[
                    ["URSSAF", sim.co, "#ff6b6b"],
                    [sim.is ? "IS + IR" : "IR", (sim.is || 0) + sim.ir, "#ffa94d"],
                    ["Net perso", sim.net, st.accent],
                    ...(sim.ret > 0 ? [["Dans la société" as string, sim.ret as number, "#34d399" as string] as [string, number, string]] : []),
                  ]}
                  mx={ca}
                />
              </div>
            </div>
          )}
          {tab === "flow" && flowEl}
          {tab === "cotis" && (
            <div className="grid gap-2.5">
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
    <TooltipProvider>
      <div className="min-h-screen p-4 md:px-6">
        <div className="max-w-[1300px] mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Simulateur Freelance Dev</h1>
            <p className="text-text-dim text-xs mt-1">Comparez 5 statuts · Barème 2026 · Ajustez CA, régime fiscal et stratégie</p>
          </div>

          {/* Controls */}
          <div className="mb-4 bg-bg-card border-2 border-[#1a1a3e] rounded-xl">
            <div className="p-4 md:p-5">
              {/* CA Slider */}
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-text-muted flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-sasu" />
                    CA annuel HT
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-white font-mono">{fmt(ca)}</span>
                </div>
                <input
                  type="range" min={30000} max={500000} step={5000}
                  value={ca} onChange={e => setCa(+e.target.value)}
                  className="w-full cursor-pointer accent-sasu"
                  aria-label="Chiffre d'affaires annuel"
                />
                <div className="flex justify-between text-[10px] text-text-dim mt-0.5">
                  <span>30k</span><span>100k</span><span>200k</span><span>300k</span><span>500k</span>
                </div>
                {isCapped && <div className="mt-1 text-[11px] text-tax">{"⚠️ Micro plafonné à " + fmt(MICRO_CAP)}</div>}
              </div>

              <div className="h-px bg-border-custom mb-3" />

              {/* Controls row */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 md:gap-5 items-start">
                <div>
                  <div className="text-[13px] text-text-muted mb-1.5 flex items-center gap-1.5">
                    <Users size={14} className="text-sasu" />
                    Parts IR
                  </div>
                  <div className="flex gap-1">
                    {[1, 1.5, 2, 2.5, 3].map(p => (
                      <button
                        key={p}
                        onClick={() => setParts(p)}
                        className={cn(
                          "px-2.5 py-1 rounded-md border-none cursor-pointer font-semibold text-[13px] transition-all",
                          parts === p ? "bg-sasu text-bg-primary" : "bg-bg-input text-text-muted hover:text-white"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-text-dim mt-1">1=célib · 2=couple · +0.5/enfant</div>
                </div>

                <div className="text-center">
                  <div className="text-[13px] text-text-muted mb-1.5 flex items-center justify-center gap-1.5">
                    <Target size={14} className="text-sasu" />
                    Stratégie
                  </div>
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => setGm("A")}
                      className={cn(
                        "px-3.5 py-1 rounded-md border-none cursor-pointer font-semibold text-[13px] transition-all",
                        gm === "A" ? "bg-capital text-bg-primary" : "bg-bg-input text-text-muted hover:text-white"
                      )}
                    >
                      A — Tout en salaire
                    </button>
                    <button
                      onClick={() => setGm("B")}
                      className={cn(
                        "px-3.5 py-1 rounded-md border-none cursor-pointer font-semibold text-[13px] transition-all",
                        gm === "B" ? "bg-solde text-bg-primary" : "bg-bg-input text-text-muted hover:text-white"
                      )}
                    >
                      B — Capitaliser
                    </button>
                  </div>
                  <div className="text-[10px] text-text-dim mt-1">B = salaire choisi + capital en société (IS requis)</div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] text-text-muted mb-1.5">Seuil IS 15%</div>
                  <ToggleGroup
                    options={[
                      { v: "standard", l: "≤ " + fmt(IS_SEUIL_REDUIT), c: "#34d399" },
                      { v: "plf2026", l: "≤ " + fmt(IS_SEUIL_PLF2026), c: "#f59e0b" },
                    ]}
                    value={isSeuilEtendu ? "plf2026" : "standard"}
                    onChange={v => setIsSeuilEtendu(v === "plf2026")}
                    size="sm"
                  />
                  {isSeuilEtendu && (
                    <div className="text-[9px] text-solde mt-1 leading-snug max-w-[220px] ml-auto">
                      <a href="https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/2531" target="_blank" rel="noopener noreferrer" className="text-solde underline">
                        Amendement I-2531
                      </a>{" "}— voté en 1ère lecture (oct. 2025). Passage au Sénat puis promulgation attendue fin 2026.
                    </div>
                  )}
                  {gm === "A" && <div className="text-[9px] text-text-dim mt-0.5 text-right">Effet visible en mode B uniquement</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Structure Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
            {structs.map(st => {
              const d = getData(st.id);
              const total = d.net + d.ret;
              const showB = gm === "B" && !st.noB;
              return (
                <div
                  key={st.id}
                  onClick={() => openD(st.id)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 relative border-2 rounded-xl hover:scale-[1.02]",
                    sel === st.id ? "bg-bg-card-hover" : "bg-bg-card"
                  )}
                  style={{
                    borderColor: sel === st.id ? st.color : "#1a1a3e",
                    ...(sel === st.id ? { background: st.color + "15" } : {}),
                  }}
                >
                  <div className="p-3">
                    {st.id === "micro" && isCapped && microTab === "real" && (
                      <span className="absolute -top-2 left-1.5 bg-charge text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PLAFONNÉ</span>
                    )}
                    {st.id === "micro" && isCapped && microTab === "hypo" && (
                      <span className="absolute -top-2 left-1.5 bg-solde text-bg-primary text-[8px] font-bold px-1.5 py-0.5 rounded">FICTIF</span>
                    )}
                    {showB && (
                      <span className="absolute -top-2 right-1.5 bg-solde text-bg-primary text-[8px] font-bold px-1.5 py-0.5 rounded">MODE B</span>
                    )}
                    {st.noB && gm === "B" && (
                      <span className="absolute -top-2 right-1.5 bg-text-dim text-white text-[8px] font-bold px-1.5 py-0.5 rounded">{st.id === "micro" ? "MICRO" : "IR"}</span>
                    )}
                    <div className="text-xl mb-0.5">{st.icon}</div>
                    <div className="font-semibold text-xs mb-1.5" style={{ color: st.accent }}>{st.name}</div>
                    <div className="text-[22px] font-bold text-white font-mono">{fmt(d.net)}</div>
                    <div className="text-[10px] text-text-muted mb-0.5">{d.ret > 0 ? "net perso/an" : "net après IR/an"}</div>
                    <div className="text-[13px]">
                      <span className="font-semibold font-mono" style={{ color: st.accent }}>{fmt(Math.round(d.net / 12))}</span>
                      <span className="text-text-dim">/mois</span>
                    </div>
                    {d.ret > 0 && (
                      <div className="mt-1 py-0.5 px-1.5 bg-capital/5 border border-capital/15 rounded text-[10px] text-capital">
                        {"+ " + fmt(d.ret) + " dans la société"}
                      </div>
                    )}
                    <div className="mt-1.5 mb-0.5">
                      <Bar v={total} mx={ca} c={st.accent} />
                    </div>
                    <div className="text-[9px] text-text-dim">{d.dCA > 0 ? Math.round(total / d.dCA * 100) : 0}% conservé</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          {renderDetail()}

          {/* Disclaimer */}
          <div className="bg-bg-card border-2 border-[#1a1a3e] rounded-xl p-2.5 text-[10px] text-text-dim leading-relaxed">
              {"⚠️ Barème 2026. Simulation simplifiée. Micro BNC (abattement 34%). TNS ~43%, charges SASU ~77%. IS : 15% ≤ " + fmt(isSeuil) + ", 25% au-delà. EI peut opter IS depuis 2022. SASU peut opter IR (5 ans max). Carrière complète = 43 ans. Valider avec un expert-comptable."}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
