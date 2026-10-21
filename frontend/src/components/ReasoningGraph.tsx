import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  PanOnScrollMode,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Activity,
  BookOpen,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';

// Custom Fact Node Component
const CustomFactNode: React.FC<{ data: any }> = ({ data }) => {
  const isUnknown = data.status === 'unknown';
  const isDerived = data.kind === 'derived_fact';

  return (
    <div
      className={`px-3 py-2 rounded-lg text-xs font-mono shadow-xs border transition-all ${
        isUnknown
          ? 'bg-amber-50 border-amber-300 text-amber-900 border-dashed'
          : isDerived
          ? 'bg-teal-50 border-teal-400 text-teal-950 font-semibold ring-1 ring-teal-500/20'
          : 'bg-white border-slate-300 text-slate-800'
      }`}
      style={{ minWidth: 150 }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-teal-600" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans">
          {data.kind === 'user_fact' ? 'User Fact' : isDerived ? 'Derived Fact' : 'Unknown Fact'}
        </span>
        {isDerived && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
      </div>
      <div className="font-bold truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-teal-600" />
    </div>
  );
};

// Custom Rule Node Component
const CustomRuleNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div
      className="px-3.5 py-2.5 rounded-lg text-xs shadow-sm border border-slate-300 bg-white hover:border-teal-500 transition-all text-slate-900 ring-1 ring-slate-200"
      style={{ minWidth: 200, maxWidth: 260 }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-teal-600" />
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200/60">
          {data.ruleId}
        </span>
        {data.step && (
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            Step {data.step}
          </span>
        )}
      </div>
      <div className="font-semibold text-slate-900 leading-tight mb-1 text-[11px]">
        {data.label}
      </div>
      {data.category && (
        <span className="text-[9px] text-slate-400 block truncate font-sans">
          {data.category}
        </span>
      )}
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-600" />
    </div>
  );
};

// Custom Proof Tree Node Component (for Backward Chaining)
const CustomProofNode: React.FC<{ data: any }> = ({ data }) => {
  const isSupported = data.status === 'SUPPORTED';
  const isUndetermined = data.status === 'UNDETERMINED';

  return (
    <div
      className={`px-3 py-2.5 rounded-lg text-xs shadow-sm border transition-all text-slate-900 ${
        isSupported
          ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-500/20'
          : isUndetermined
          ? 'bg-amber-50 border-amber-300 border-dashed'
          : 'bg-rose-50 border-rose-400'
      }`}
      style={{ minWidth: 180, maxWidth: 240 }}
    >
      <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-indigo-600" />
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Goal Node
        </span>
        <span
          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
            isSupported
              ? 'bg-emerald-600 text-white'
              : isUndetermined
              ? 'bg-amber-500 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {data.status}
        </span>
      </div>
      <div className="font-mono font-bold text-slate-900 truncate mb-1">
        {data.label}
      </div>
      <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">
        {data.reason}
      </p>
      <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-indigo-600" />
    </div>
  );
};

interface ReasoningGraphProps {
  graphData: {
    nodes: Node[];
    edges: Edge[];
  };
  mode: string;
}

const GraphCanvas: React.FC<ReasoningGraphProps> = ({ graphData, mode }) => {
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const [scrollMode, setScrollMode] = useState<'pan' | 'zoom'>('pan');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      factNode: CustomFactNode,
      derivedNode: CustomFactNode,
      ruleNode: CustomRuleNode,
      proofNode: CustomProofNode,
    }),
    []
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 });
  }, [fitView]);

  // Automatically center and fit graph when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 100);
    return () => clearTimeout(timer);
  }, [graphData, fitView]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header with Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Interactive Reasoning Proof Graph
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'forward'
              ? 'Data-Driven Chain: User Observations -> Production Rules -> Derived Conclusions'
              : 'Goal-Driven Proof Tree: Target Hypothesis -> Rules Examined -> Subgoals & Facts'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Observation/Derived
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Rule
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Unknown
          </span>
        </div>
      </div>

      {/* Navigation Control Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Quick Interaction Tips */}
        <div className="text-[11px] text-slate-600 flex items-center gap-2">
          <span className="font-semibold text-slate-800">Navigation:</span>
          <span>🖱️ Click & drag or scroll to pan</span>
          <span className="text-slate-300">•</span>
          <span>Use <strong>+ / &minus;</strong> or hold <strong>Ctrl+Scroll</strong> to zoom</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Scroll Mode Toggle */}
          <button
            onClick={() => setScrollMode((m) => (m === 'pan' ? 'zoom' : 'pan'))}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              scrollMode === 'pan'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle whether mouse scroll wheel pans (moves) or zooms"
          >
            <Move className="w-3.5 h-3.5 text-teal-600" />
            <span>Wheel: {scrollMode === 'pan' ? 'Move / Pan' : 'Zoom'}</span>
          </button>

          {/* Reset / Fit View Button */}
          <button
            onClick={handleFitView}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium shadow-2xs transition-colors"
            title="Reset zoom & center all nodes in view"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Fit View</span>
          </button>

          {/* Zoom In */}
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Expand Height */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs"
            title={isExpanded ? 'Collapse Canvas' : 'Expand Canvas Height'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Container */}
      <div
        className={`relative w-full rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'h-[750px]' : 'h-[520px]'
        }`}
      >
        <ReactFlow
          nodes={graphData.nodes || []}
          edges={graphData.edges || []}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2.0}
          panOnScroll={scrollMode === 'pan'}
          panOnScrollMode={PanOnScrollMode.Free}
          zoomOnScroll={scrollMode === 'zoom'}
          zoomOnPinch={true}
          panOnDrag={true}
          nodesDraggable={true}
          elementsSelectable={true}
        >
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            nodeStrokeColor="#0d9488"
            nodeColor="#f8fafc"
            className="!border !border-slate-300 !rounded-lg !bg-white"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl p-4 shadow-lg z-20 space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Node Inspector
              </span>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-bold text-sm text-slate-900 mb-1">
                {selectedNodeData.label}
              </div>
              {selectedNodeData.ruleId && (
                <span className="font-mono text-xs text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  {selectedNodeData.ruleId}
                </span>
              )}
            </div>

            {selectedNodeData.explanation && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Clinical Rationale
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                  {selectedNodeData.explanation}
                </p>
              </div>
            )}

            {selectedNodeData.reason && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Proof Status Rationale
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                  {selectedNodeData.reason}
                </p>
              </div>
            )}

            {selectedNodeData.source && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedNodeData.source}</span>
              </div>
            )}

            {selectedNodeData.unresolved && selectedNodeData.unresolved.length > 0 && (
              <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold text-[10px] uppercase">Unresolved Premises:</span>
                {selectedNodeData.unresolved.map((u: any, idx: number) => (
                  <div key={idx} className="font-mono text-[10px]">
                    {u.fact}: {u.condition} ({u.reason})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 text-center">
        Tip: Click any node in the graph to inspect matched preconditions, KDIGO rationale, and working memory provenance.
      </p>
    </div>
  );
};

export const ReasoningGraph: React.FC<ReasoningGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
};
