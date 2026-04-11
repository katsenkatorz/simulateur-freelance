"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { fmt } from "@/lib/engine";
import type { SankeyData } from "@/lib/sankey";

interface SankeyOverviewProps {
  data: SankeyData;
  accent: string;
}

export function SankeyOverview({ data, accent }: SankeyOverviewProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveSankey
        data={data}
        margin={{ top: 20, right: 140, bottom: 20, left: 20 }}
        align="justify"
        colors={(node: Record<string, unknown>) => (node.color as string) || accent}
        nodeOpacity={1}
        nodeHoverOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={14}
        nodeSpacing={18}
        nodeBorderWidth={0}
        nodeBorderRadius={4}
        linkOpacity={0.3}
        linkHoverOpacity={0.6}
        linkHoverOthersOpacity={0.1}
        linkContract={1}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={12}
        labelTextColor={{ from: "color", modifiers: [["brighter", 0.8]] }}
        animate={true}
        motionConfig="gentle"
        valueFormat={(v) => fmt(v)}
        theme={{
          text: {
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          },
          tooltip: {
            container: {
              background: "#18181b",
              color: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #3f3f46",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            },
          },
        }}
      />
    </div>
  );
}
