"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import { fmt } from "@/lib/engine";

type FlowNodeData = {
  label: string;
  amount: number;
  sub?: string;
  color: string;
  icon?: string;
};

type FlowNodeType = Node<FlowNodeData, "flowNode">;

export function FlowCustomNode({ data }: NodeProps<FlowNodeType>) {
  const isNeutral = data.color === "#71717a";

  return (
    <div className="relative rounded-lg bg-bg-card border border-border-default px-5 py-3.5 min-w-[175px] text-center shadow-md">
      {/* Accent line */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
        style={{ background: data.color, opacity: isNeutral ? 0.3 : 0.5 }}
      />

      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />

      <div className="text-[11px] font-medium mb-1.5 text-text-secondary tracking-wide">
        {data.icon ? data.icon + " " : ""}{data.label}
      </div>
      <div className="text-[17px] font-bold font-mono text-text-primary leading-tight">
        {fmt(data.amount)}
      </div>
      {data.sub && (
        <div className="text-[10px] text-text-tertiary mt-1">{data.sub}</div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}
