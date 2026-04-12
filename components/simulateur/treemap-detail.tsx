"use client";

import { Treemap } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmt } from "@/lib/engine";
import type { Sim, CotisItem } from "@/lib/types";

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
  const nodes: { name: string; size: number; fill: string; category: string; detail?: string }[] = [];

  // Cotisations breakdown
  cotisItems.forEach(c => {
    if (c.a > 0) {
      nodes.push({ name: stripEmoji(c.n), size: c.a, fill: "#71717a", category: "Cotisations" });
    }
  });

  // Charges fixes
  const chargesFixes = sel === "holding" ? 7000 : 3000;
  if (chargesFixes > 0) {
    nodes.push({ name: "Charges fixes", size: chargesFixes, fill: "#52525b", category: "Cotisations", detail: "Comptabilité, juridique" });
  }

  // IS breakdown
  if (sim.isD) {
    if (sim.isD.is15 > 0) nodes.push({ name: "IS 15%", size: sim.isD.is15, fill: "#a1a1aa", category: "Impôts" });
    if (sim.isD.is25 > 0) nodes.push({ name: "IS 25%", size: sim.isD.is25, fill: "#78716c", category: "Impôts" });
  }
  if (sel === "holding" && sim.isSASU) {
    if (sim.isSASU.is15 > 0) nodes.push({ name: "IS SASU 15%", size: sim.isSASU.is15, fill: "#a1a1aa", category: "Impôts" });
    if (sim.isSASU.is25 > 0) nodes.push({ name: "IS SASU 25%", size: sim.isSASU.is25, fill: "#78716c", category: "Impôts" });
    if (sim.isH?.is15 > 0) nodes.push({ name: "IS Hold. 15%", size: sim.isH.is15, fill: "#a1a1aa", category: "Impôts" });
    if (sim.isH?.is25 > 0) nodes.push({ name: "IS Hold. 25%", size: sim.isH.is25, fill: "#78716c", category: "Impôts" });
  }

  // IR
  if (sim.ir > 0) {
    nodes.push({ name: "IR", size: sim.ir, fill: "#a3a3a3", category: "Impôts", detail: "Barème progressif, abatt. 10%" });
  }

  // Net
  nodes.push({ name: "Net personnel", size: Math.max(1, sim.net), fill: "#e4e4e7", category: "Net", detail: fmt(Math.round(sim.net / 12)) + "/mois" });

  // Capital
  if (sim.ret > 0) {
    nodes.push({ name: "Capital société", size: sim.ret, fill: "#22c55e", category: "Capital", detail: "Restant dans la structure" });
  }

  const data = nodes.map(n => ({ ...n, size: Math.max(1, n.size) }));

  // Build chart config
  const chartConfig: ChartConfig = {};
  data.forEach(n => {
    chartConfig[n.name] = { label: n.name, color: n.fill };
  });

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full aspect-auto">
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#09090b"
        animationDuration={600}
        content={<CustomContent />}
      >
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              hideIndicator
              formatter={(value, name, item) => {
                const node = data.find(n => n.name === name) || item?.payload;
                return (
                  <div className="space-y-1">
                    {node?.category && (
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{node.category}</div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{name}</span>
                      <span className="font-mono font-bold">{fmt(Number(value))}</span>
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      {ca > 0 ? Math.round(Number(value) / ca * 100) : 0}% du CA
                    </div>
                    {node?.detail && <div className="text-muted-foreground/60 text-[10px]">{node.detail}</div>}
                  </div>
                );
              }}
            />
          }
        />
      </Treemap>
    </ChartContainer>
  );
}

function CustomContent(props: any) {
  const { x, y, width, height, name, fill, size } = props;
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
        rx={3}
        fill={fill || "#27272a"}
        stroke="#09090b"
        strokeWidth={2}
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + (showAmount ? height / 2 - 7 : height / 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#09090b"
          fontSize={width > 120 ? 11 : 9}
          fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          {name}
        </text>
      )}
      {showAmount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#09090b"
          fontSize={width > 120 ? 11 : 9}
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
