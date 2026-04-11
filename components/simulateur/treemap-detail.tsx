"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { fmt } from "@/lib/engine";
import type { Sim, CotisItem } from "@/lib/types";

interface TreemapNode {
  name: string;
  size: number;
  color: string;
  category: string;
  detail?: string;
}

interface TreemapDetailProps {
  sim: Sim;
  cotisItems: CotisItem[];
  ca: number;
  sel: string;
  isB: boolean;
}

function stripEmoji(s: string): string {
  return s.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]/gu, "").trim();
}

export function TreemapDetail({ sim, cotisItems, ca, sel, isB }: TreemapDetailProps) {
  const nodes: TreemapNode[] = [];

  // Cotisations breakdown
  cotisItems.forEach(c => {
    if (c.a > 0) {
      nodes.push({
        name: stripEmoji(c.n),
        size: c.a,
        color: "#71717a",
        category: "Cotisations",
      });
    }
  });

  // Charges fixes
  const chargesFixes = sel === "holding" ? 7000 : 3000; // SASU + Holding or just société
  if (chargesFixes > 0) {
    nodes.push({
      name: "Charges fixes",
      size: chargesFixes,
      color: "#52525b",
      category: "Cotisations",
      detail: "Comptabilité, juridique, etc.",
    });
  }

  // IS breakdown (if mode B or holding)
  if (sim.isD) {
    if (sim.isD.is15 > 0) nodes.push({ name: "IS 15%", size: sim.isD.is15, color: "#a1a1aa", category: "Impôts" });
    if (sim.isD.is25 > 0) nodes.push({ name: "IS 25%", size: sim.isD.is25, color: "#78716c", category: "Impôts" });
  }
  if (sel === "holding" && sim.isSASU) {
    if (sim.isSASU.is15 > 0) nodes.push({ name: "IS SASU 15%", size: sim.isSASU.is15, color: "#a1a1aa", category: "Impôts" });
    if (sim.isSASU.is25 > 0) nodes.push({ name: "IS SASU 25%", size: sim.isSASU.is25, color: "#78716c", category: "Impôts" });
    if (sim.isH && sim.isH.total > 0) {
      if (sim.isH.is15 > 0) nodes.push({ name: "IS Hold. 15%", size: sim.isH.is15, color: "#a1a1aa", category: "Impôts" });
      if (sim.isH.is25 > 0) nodes.push({ name: "IS Hold. 25%", size: sim.isH.is25, color: "#78716c", category: "Impôts" });
    }
  }

  // IR
  if (sim.ir > 0) {
    nodes.push({
      name: "IR (barème progressif)",
      size: sim.ir,
      color: "#a3a3a3",
      category: "Impôts",
      detail: "Après abattement 10%",
    });
  }

  // Net
  nodes.push({
    name: "Net personnel",
    size: Math.max(1, sim.net),
    color: "#e4e4e7",
    category: "Net",
    detail: fmt(Math.round(sim.net / 12)) + "/mois",
  });

  // Capital
  if (sim.ret > 0) {
    nodes.push({
      name: "Capital société",
      size: sim.ret,
      color: "#22c55e",
      category: "Capital",
      detail: "Restant dans la structure",
    });
  }

  const data = [{ name: "CA", children: nodes.map(n => ({ ...n, size: Math.max(1, n.size) })) }];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          aspectRatio={4 / 1}
          stroke="#09090b"
          animationDuration={600}
          content={<CustomTreemapContent />}
        >
          <Tooltip content={<CustomTooltip ca={ca} />} cursor={false} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, color, size } = props;
  if (width < 4 || height < 4) return null;

  const showName = width > 50 && height > 24;
  const showAmount = width > 70 && height > 36;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={color || "#27272a"}
        stroke="#09090b"
        strokeWidth={2}
        className="transition-opacity hover:opacity-80"
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + (showAmount ? height / 2 - 6 : height / 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#09090b"
          fontSize={width > 100 ? 11 : 9}
          fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          {name}
        </text>
      )}
      {showAmount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#09090b"
          fontSize={width > 100 ? 11 : 9}
          fontWeight={500}
          fontFamily="var(--font-mono)"
          opacity={0.7}
        >
          {fmt(size)}
        </text>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload, ca }: { active?: boolean; payload?: any[]; ca: number }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[#18181b] border border-[#3f3f46] px-4 py-3 rounded-lg shadow-xl">
      <div className="text-[10px] uppercase tracking-wider text-[#71717a] mb-0.5">{data.category}</div>
      <div className="text-xs font-medium text-[#a1a1aa] mb-1">{data.name}</div>
      <div className="text-base font-bold font-mono text-[#fafafa]">{fmt(data.size)}</div>
      <div className="text-[11px] text-[#71717a] mt-1">
        {ca > 0 ? Math.round(data.size / ca * 100) : 0}% du CA
      </div>
      {data.detail && <div className="text-[11px] text-[#52525b] mt-0.5">{data.detail}</div>}
    </div>
  );
}
