"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { fmt } from "@/lib/engine";
import type { SankeyData } from "@/lib/sankey";

interface SankeyOverviewProps {
  data: SankeyData;
  accent: string;
}

export function SankeyOverview({ data }: SankeyOverviewProps) {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveSankey
        data={data}
        margin={{ top: 24, right: 160, bottom: 24, left: 40 }}
        align="justify"
        colors={(node: Record<string, unknown>) => (node.color as string) || "#71717a"}
        nodeOpacity={1}
        nodeHoverOpacity={1}
        nodeHoverOthersOpacity={0.25}
        nodeThickness={16}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOpacity={0.8}
        linkHoverOthersOpacity={0.1}
        linkContract={2}
        linkBlendMode="normal"
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={14}
        labelTextColor="#a1a1aa"
        animate={true}
        motionConfig="gentle"
        valueFormat={(v) => fmt(v)}
        theme={{
          text: {
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
          },
          tooltip: {
            container: {
              background: "#18181b",
              color: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #3f3f46",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              padding: "8px 12px",
            },
          },
        }}
      />
    </div>
  );
}
