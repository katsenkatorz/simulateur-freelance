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
  return (
    <div className="relative rounded-lg border border-border-default bg-bg-card px-5 py-3 min-w-[170px] text-center">
      {/* Accent bar top */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-full opacity-60"
        style={{ background: data.color }}
      />

      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />

      <div className="text-[11px] font-medium mb-1 text-text-secondary">
        {data.icon ? data.icon + " " : ""}{data.label}
      </div>
      <div className="text-base font-bold font-mono text-text-primary">
        {fmt(data.amount)}
      </div>
      {data.sub && (
        <div className="text-[10px] text-text-tertiary mt-0.5">{data.sub}</div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}
