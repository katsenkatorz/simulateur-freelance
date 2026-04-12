"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
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
import { RepartitionBar, type Segment } from "@/components/simulateur/repartition-bar";
import { TreemapDetail } from "@/components/simulateur/treemap-detail";
import { ComparisonMini } from "@/components/simulateur/comparison-mini";
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
  const isSolde = d.t === "s";
  return (
    <div className={cn("flex justify-between py-2 text-sm", isSolde ? "font-medium text-text-primary" : "text-text-secondary")}>
      <span>{d.l}</span>
      <span className={cn("whitespace-nowrap ml-3 font-mono", d.a < 0 && "text-text-tertiary")}>
        {d.a >= 0 ? fmt(d.a) : "- " + fmt(Math.abs(d.a))}
      </span>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-card text-sm font-medium text-text-primary cursor-pointer hover:bg-bg-elevated transition-colors"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={cn("text-text-tertiary transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 py-3 border-t border-border-subtle">{children}</div>}
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

function stripEmoji(s: string): string {
  return s.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]/gu, "").trim();
}

function StatusDot({ status }: { status: string }) {
  if (status.includes("❌")) return <span className="inline-block w-2 h-2 rounded-full bg-negative" title="Non couvert" />;
  if (status.includes("⚠")) return <span className="inline-block w-2 h-2 rounded-full bg-tax" title="Partiel" />;
  if (status.includes("✅✅")) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-positive ring-2 ring-positive/30" title="Excellente couverture" />;
  if (status.includes("✅")) return <span className="inline-block w-2 h-2 rounded-full bg-positive" title="Couvert" />;
  return <span className="inline-block w-2 h-2 rounded-full bg-text-tertiary" title="Variable" />;
}

function CotisInner({ items }: { items: CotisItem[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((it, i) => (
          <tr key={i} className="border-b border-border-subtle last:border-0">
            <td className="py-2.5 text-text-secondary">{stripEmoji(it.n)}</td>
            <td className={cn("py-2.5 font-mono font-medium text-right w-24", it.a > 0 ? "text-text-primary" : "text-text-tertiary")}>
              {it.a > 0 ? fmt(it.a) : "—"}
            </td>
            <td className="py-2.5 text-center w-8">
              <StatusDot status={it.c} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RetInner({ info }: { info: RetResult }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-text-secondary">
        <span>Pension mensuelle estimée</span>
        <span className="font-mono font-medium text-text-primary">~{fmt(info.pen)}/mois</span>
      </div>
      <div className="flex justify-between text-text-secondary">
        <span>Trimestres validés par an</span>
        <span className="font-mono font-medium text-text-primary">{info.tr}/4</span>
      </div>
      <div className="flex justify-between text-text-secondary">
        <span>Carrière complète</span>
        <span className="text-text-tertiary">43 ans (172 trimestres, né(e) après 1973)</span>
      </div>
    </div>
  );
}

function CapUsage({ type }: { type: string }) {
  const data: Record<string, { t: string; i: [string, string, "ok" | "warn" | "good"][] }> = {
    eurl: { t: "Utilisation du capital (EURL)", i: [["Embaucher / Matériel", "Investissement productif", "ok"], ["Dividendes futurs", "Soumis TNS > 10% capital", "warn"], ["Bourse", "Risque requalification", "warn"]] },
    sasu: { t: "Utilisation du capital (SASU)", i: [["Embaucher / Matériel", "Investissement productif", "ok"], ["Dividendes futurs", "Flat tax 30% SANS cotisations", "good"], ["Bourse", "Change l'objet social", "warn"]] },
    holding: { t: "Utilisation du capital (Holding)", i: [["Bourse / ETF", "Investir à l'IS", "good"], ["Crédit Lombard", "Emprunter sans vendre", "good"], ["SCI / Immobilier", "Via la holding", "good"], ["Prêt CCA", "Remboursement non imposé", "good"], ["Levier fiscal", "IS 15-25% vs IR 30-45%", "good"]] },
    ei: { t: "Utilisation du capital (EI IS)", i: [["Matériel / Trésorerie", "Investissement", "ok"], ["Patrimoine", "Séparé depuis 2022 mais pas de personnalité morale", "warn"]] },
  };
  const d = data[type];
  if (!d) return null;
  return (
    <div className="p-4 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="text-sm font-semibold text-text-primary mb-4">{d.t}</div>
      <div className="space-y-3">
        {d.i.map((it, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={cn(
              "inline-block w-2 h-2 rounded-full mt-1.5 shrink-0",
              it[2] === "good" ? "bg-positive" : it[2] === "warn" ? "bg-tax" : "bg-text-tertiary"
            )} />
            <div>
              <div className="text-sm font-medium text-text-primary">{it[0]}</div>
              <div className="text-xs text-text-tertiary">{it[1]}</div>
            </div>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                {(() => { const Icon = STRUCT_ICONS[st.id]; return Icon ? <Icon size={18} className="text-text-tertiary" /> : null; })()}
                {st.name}
                <span className="text-sm text-text-tertiary font-normal">
                  · Mode {st.noB ? "A" : gm}
                </span>
              </h2>
              <div className="text-sm font-mono text-text-secondary">
                {fmt(sim.net)}<span className="text-text-tertiary"> /an</span>
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
            {tab === "overview" && (() => {
              const pCo = ca > 0 ? Math.round(sim.co / ca * 100) : 0;
              const pIr = ca > 0 ? Math.round(((sim.is || 0) + sim.ir) / ca * 100) : 0;
              const pNet = ca > 0 ? Math.round(sim.net / ca * 100) : 0;
              const pRet = ca > 0 && sim.ret > 0 ? Math.round(sim.ret / ca * 100) : 0;
              const totalCharges = sim.co + (sim.is || 0) + sim.ir;

              return (
                <div className="space-y-4">
                  {/* Résumé chiffré */}
                  <div className="border border-border-subtle rounded-lg p-5">
                    {/* Ligne CA */}
                    <div className="flex justify-between text-sm text-text-secondary pb-3 border-b border-border-subtle">
                      <span>Chiffre d&apos;affaires HT</span>
                      <span className="font-mono">{fmt(ca)}</span>
                    </div>

                    {/* Montant net */}
                    <div className="flex items-baseline justify-between py-4">
                      <span className="text-sm text-text-secondary">Revenu net après impôt</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold font-mono text-text-primary">{fmt(sim.net)}</div>
                        <div className="text-sm text-text-tertiary font-mono">{fmt(Math.round(sim.net / 12))} /mois</div>
                      </div>
                    </div>

                    {sim.ret > 0 && (
                      <div className="flex items-baseline justify-between py-3 border-t border-border-subtle">
                        <span className="text-sm text-text-secondary">Capital conservé en société</span>
                        <div className="text-lg font-bold font-mono text-positive">{fmt(sim.ret)}</div>
                      </div>
                    )}

                    {/* Barre de répartition */}
                    <div className="mt-5">
                      <RepartitionBar
                        segments={[
                          { key: "cotisations", label: "Cotisations", amount: sim.co, percent: pCo, color: "#71717a", monthly: Math.round(sim.co / 12) },
                          { key: "impots", label: "Impôts", amount: (sim.is || 0) + sim.ir, percent: pIr, color: "#52525b", monthly: Math.round(((sim.is || 0) + sim.ir) / 12) },
                          { key: "net", label: "Net perso", amount: sim.net, percent: pNet, color: "#e4e4e7", monthly: Math.round(sim.net / 12) },
                          ...(pRet > 0 ? [{ key: "capital", label: "Capital", amount: sim.ret, percent: pRet, color: "#22c55e", monthly: Math.round(sim.ret / 12) } as Segment] : []),
                        ]}
                        ca={ca}
                      />
                    </div>
                  </div>

                  {/* Treemap détaillé */}
                  <Section title="Détail de la répartition">
                    <TreemapDetail sim={sim} cotisItems={cotisItems} ca={ca} sel={sel} isB={isB} />
                  </Section>

                  {/* Comparaison */}
                  <Section title="Comparer les statuts" defaultOpen={false}>
                    <ComparisonMini
                      rows={structs.map(s => ({
                        struct: s,
                        icon: STRUCT_ICONS[s.id],
                        ...getData(s.id),
                        ca: s.id === "micro" ? mCA : ca,
                      }))}
                      selectedId={sel}
                      onSelect={openD}
                    />
                  </Section>

                  {/* Sections collapsibles */}
                  {sel === "holding" && (
                    <>
                      <Section title="SASU opérationnelle">
                        {sim.sasuL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                      </Section>
                      <Section title="Holding">
                        {sim.holdL.map((d: Line, i: number) => <LI key={i} d={d} />)}
                      </Section>
                    </>
                  )}

                  <Section title="Détail du calcul">
                    {sim.lines.map((d: Line, i: number) => <LI key={i} d={d} />)}
                    <div className="flex justify-between pt-3 mt-1 border-t border-border-subtle text-sm font-bold text-text-primary">
                      <span>Net après impôt</span>
                      <span className="font-mono">{fmt(sim.net)}</span>
                    </div>
                  </Section>

                  {/* Résumé compact en bas */}
                  <div className="flex justify-between text-xs text-text-tertiary px-1">
                    <span>Total prélevé : {fmt(totalCharges)} ({ca > 0 ? Math.round(totalCharges / ca * 100) : 0}% du CA)</span>
                    <span>Conservé : {fmt(sim.net + (sim.ret || 0))} ({ca > 0 ? Math.round((sim.net + (sim.ret || 0)) / ca * 100) : 0}%)</span>
                  </div>
                </div>
              );
            })()}
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
                {/* Résumé cotisations */}
                <div className="border border-border-subtle rounded-lg p-5">
                  <div className="flex justify-between items-baseline pb-3 border-b border-border-subtle">
                    <span className="text-sm text-text-secondary">Total cotisations sociales</span>
                    <span className="text-2xl font-bold font-mono text-text-primary">{fmt(cotisItems.reduce((s, c) => s + c.a, 0))}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3">
                    <span className="text-sm text-text-secondary">Retraite estimée</span>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-text-primary">~{fmt(retData.pen)}/mois</span>
                      <div className="text-[11px] text-text-tertiary">{retData.tr}/4 trimestres validés/an</div>
                    </div>
                  </div>
                </div>
                <Section title="Détail des cotisations">
                  <CotisInner items={cotisItems} />
                </Section>
                <Section title="Retraite" defaultOpen={false}>
                  <RetInner info={retData} />
                </Section>
              </div>
            )}
            {tab === "capital" && isB && <CapUsage type={sel === "holding" ? "holding" : sel} />}
          </div>
        </main>
      </div>
    </div>
  );
}
