import { fmt } from "@/lib/engine";

interface FlowNodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label: string;
  amount: number;
  sub?: string;
  delay?: number;
}

export function FlowNode({ x, y, w, h, color, label, amount, sub, delay }: FlowNodeProps) {
  return (
    <g className="fn" style={{ animationDelay: (delay || 0) + "s" }}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#0d0d20" stroke={color + "55"} strokeWidth={1.5} />
      <rect x={x} y={y} width={w} height={3} rx={1.5} fill={color} opacity={0.7} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fill={color} fontSize={9.5} fontWeight={600} className="font-sans">
        {label}
      </text>
      <text x={x + w / 2} y={y + 33} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700} className="font-mono">
        {fmt(amount)}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 46} textAnchor="middle" fill="#555" fontSize={7.5} className="font-sans">
          {sub}
        </text>
      )}
    </g>
  );
}
