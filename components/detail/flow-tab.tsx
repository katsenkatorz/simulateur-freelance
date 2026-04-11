"use client";

import { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowCustomNode } from "@/components/flow/custom-node";
import { FlowCustomEdge } from "@/components/flow/custom-edge";
import {
  buildFlowSimple,
  buildFlowSplit,
  buildFlowHoldingA,
  buildFlowHoldingB,
} from "@/components/flow/flow-config";
import type { Sim } from "@/lib/types";
import { MICRO_TAUX_LABEL } from "@/lib/engine";
import { SASU_COEFF_NET, CHARGES_FIXES_SOCIETE } from "@/lib/fiscal";

const nodeTypes = { flowNode: FlowCustomNode };
const edgeTypes = { flowEdge: FlowCustomEdge };

interface FlowTabProps {
  sel: string;
  sim: Sim;
  isB: boolean;
  accent: string;
  regEI: string;
  regEURL: string;
  regSASU: string;
  eiCanB: boolean;
  eurlCanB: boolean;
  sasuCanB: boolean;
}

export function FlowTab({ sel, sim, isB, accent, regEI, regEURL, regSASU, eiCanB, eurlCanB, sasuCanB }: FlowTabProps) {
  const { nodes, edges } = useMemo(() => {
    if (sel === "micro") {
      return buildFlowSimple(sim, "#60a5fa", "🧑‍💻", "Micro", MICRO_TAUX_LABEL);
    }
    if (sel === "ei") {
      return (eiCanB && isB)
        ? buildFlowSplit(sim, "#2dd4bf", "📋", "EI IS", "Matériel · Trésorerie")
        : buildFlowSimple(sim, "#2dd4bf", "📋", "EI " + regEI, "TNS ~43%");
    }
    if (sel === "eurl") {
      return (eurlCanB && isB)
        ? buildFlowSplit(sim, "#34d399", "🏢", "EURL IS", "Embauche · Matériel")
        : buildFlowSimple(sim, "#34d399", "🏢", "EURL " + regEURL, "TNS ~43%");
    }
    if (sel === "sasu") {
      const simAdj = (sasuCanB && isB) ? { ...sim, cotisOnly: sim.co - CHARGES_FIXES_SOCIETE } : sim;
      return (sasuCanB && isB)
        ? buildFlowSplit(simAdj, "#a78bfa", "🏛️", "SASU IS", "Div. flat tax 30%")
        : buildFlowSimple(sim, "#a78bfa", "🏛️", "SASU " + regSASU, "~77% du brut");
    }
    // holding
    return isB ? buildFlowHoldingB(sim) : buildFlowHoldingA(sim);
  }, [sel, sim, isB, accent, regEI, regEURL, regSASU, eiCanB, eurlCanB, sasuCanB]);

  const isHolding = sel === "holding";
  const height = isHolding ? (isB ? 750 : 700) : (isB ? 450 : 420);

  return (
    <ReactFlowProvider>
      <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-border-subtle">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
