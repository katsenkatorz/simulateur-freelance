"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps, type Edge } from "@xyflow/react";

type FlowEdgeData = {
  label?: string;
  color: string;
};

type FlowEdgeType = Edge<FlowEdgeData, "flowEdge">;

export function FlowCustomEdge(props: EdgeProps<FlowEdgeType>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const color = data?.color || "#a1a1aa";

  return (
    <>
      {/* Shadow path */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.08}
      />
      {/* Main path */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 2,
          strokeOpacity: 0.6,
        }}
      />
      {/* Animated dash */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeOpacity={0.8}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-10"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      {/* Particle */}
      <circle r={3} fill={color} opacity={0.9}>
        <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
      </circle>
      {/* Label */}
      {data?.label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect x={-30} y={-10} width={60} height={18} rx={4} fill="#18181b" stroke={color + "30"} strokeWidth={1} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={10}
            fontWeight={500}
            fontFamily="var(--font-sans)"
            dy={-1}
          >
            {data.label}
          </text>
        </g>
      )}
    </>
  );
}
