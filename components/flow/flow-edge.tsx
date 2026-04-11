interface FlowEdgeProps {
  path: string;
  color: string;
  label?: string;
  lx?: number;
  ly?: number;
}

export function FlowEdge({ path, color, label, lx, ly }: FlowEdgeProps) {
  return (
    <g>
      <path d={path} fill="none" stroke={color + "18"} strokeWidth={6} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} className="fl" opacity={0.7} />
      <circle r={3.5} fill={color} opacity={0.9}>
        <animateMotion dur="2s" repeatCount="indefinite" path={path} />
      </circle>
      {label && lx !== undefined && ly !== undefined && (
        <g>
          <rect
            x={lx - 3}
            y={ly - 10}
            width={label.length * 5.2 + 8}
            height={14}
            rx={3}
            fill="#0d0d20"
            opacity={0.9}
          />
          <text x={lx + 1} y={ly} fill={color} fontSize={8} fontWeight={500} className="font-sans" opacity={0.9}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
