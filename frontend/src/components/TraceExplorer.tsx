import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  GitCommit,
  HelpCircle,
  Search,
} from 'lucide-react';
import type { TraceItem } from '../types';

interface TraceExplorerProps {
  trace: TraceItem[];
  unknownFacts: string[];
}

export const TraceExplorer: React.FC<TraceExplorerProps> = ({ trace, unknownFacts }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const categories = ['all', ...Array.from(new Set(trace.map((t) => t.category)))];

  const filteredTrace = trace.filter((item) => {
    const matchesSearch =
      item.rule_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.conclusion.fact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-teal-600" />
            Inference Rule Execution Trace
          </h2>
          <p className="text-xs text-slate-500">
            Step-by-step chronological record of fired production rules and working memory updates
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search rules, facts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-300 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Unknown Facts Diagnostics Banner */}
      {unknownFacts && unknownFacts.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Explicit Unknowns:</strong> [{unknownFacts.join(', ')}]. Under classical 3-valued Kleene logic, rules requiring these premises were evaluated as <em>UNKNOWN</em> and did not fire.
          </span>
        </div>
      )}

      {/* Trace Timeline */}
      {filteredTrace.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          No rules fired matching the current criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrace.map((item) => {
            const isExpanded = expandedSteps[item.step] ?? true; // default expanded
            return (
              <div
                key={item.step}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30 transition-all hover:border-slate-300"
              >
                {/* Rule Card Header */}
                <button
                  type="button"
                  onClick={() => toggleStep(item.step)}
                  className="w-full flex items-center justify-between p-3.5 text-left bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center ring-2 ring-teal-500/10">
                      {item.step}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                          {item.rule_id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {item.rule_name}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      &rarr; {item.conclusion.fact}: <strong>{String(item.conclusion.value)}</strong>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3 text-xs">
                    {/* Antecedents / Matched Conditions */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Matched Premises (Antecedents)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.matched_conditions.map((cond, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between"
                          >
                            <span className="font-mono text-slate-700">
                              {cond.fact} {cond.operator} <strong>{String(cond.required_value)}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              actual: {String(cond.actual_value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consequent Derived */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Asserted Consequent to Working Memory
                      </span>
                      <div className="p-2 rounded bg-teal-50/80 border border-teal-200 font-mono text-teal-950 font-medium">
                        WorkingMemory.set_derived_fact(&quot;{item.conclusion.fact}&quot;, {JSON.stringify(item.conclusion.value)})
                      </div>
                    </div>

                    {/* Clinical Explanation & Source */}
                    <div className="pt-1 border-t border-slate-200/60 space-y-1">
                      <p className="text-slate-800 leading-relaxed">
                        <strong className="text-slate-900">Clinical AI Rationale:</strong> {item.explanation}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Source: {item.source}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
