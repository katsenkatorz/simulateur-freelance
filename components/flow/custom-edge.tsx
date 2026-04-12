"use client";

import { getSmoothStepPath, type EdgeProps, type Edge } from "@xyflow/react";

type FlowEdgeData = {
  label?: string;
  color: string;
};

type FlowEdgeType = Edge<FlowEdgeData, "flowEdge">;

export function FlowCustomEdge(props: EdgeProps<FlowEdgeType>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  const color = data?.color || "#71717a";
  const label = data?.label;
  const labelWidth = label ? Math.max(label.length * 6.5 + 16, 40) : 0;

  return (
    <g>
      {/* Glow path */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeOpacity={0.06}
        strokeLinecap="round"
      />

      {/* Base path */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.25}
        strokeLinecap="round"
      />

      {/* Animated flow */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.7}
        strokeLinecap="round"
        strokeDasharray="8 12"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* Particle with glow */}
      <circle r={5} fill={color} opacity={0.15}>
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
      <circle r={3} fill={color} opacity={0.8}>
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
      <circle r={1.5} fill="#fafafa" opacity={0.9}>
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>

      {/* Label */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-labelWidth / 2}
            y={-11}
            width={labelWidth}
            height={20}
            rx={4}
            fill="#09090b"
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#a1a1aa"
            fontSize={10}
            fontWeight={500}
            fontFamily="var(--font-sans)"
            dy={-1}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
