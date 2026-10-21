import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { KnowledgeRule } from '../types';

interface RulesExplorerProps {
  rules: KnowledgeRule[];
  metadata: any;
}

export const RulesExplorer: React.FC<RulesExplorerProps> = ({ rules, metadata }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const categories = ['all', ...Array.from(new Set(rules.map((r) => r.category)))];

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conclusion.fact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleRule = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Verified Knowledge Base Rules
            </h2>
            <span className="text-[11px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
              {rules.length} Rules • v{metadata?.version || '1.0.0'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Declarative production rules verified against official KDIGO 2024 Clinical Practice Guidelines
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search rule ID, concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-300 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 w-48"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRules[rule.id] ?? false;
          return (
            <div
              key={rule.id}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300 transition-all"
            >
              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className="w-full flex items-center justify-between p-3.5 text-left bg-white hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {rule.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {rule.category} • Priority: {rule.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded hidden sm:inline-block">
                    &rarr; {rule.conclusion.fact}: <strong>{String(rule.conclusion.value)}</strong>
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3 text-xs">
                  {/* Antecedent Conditions */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Antecedents (IF):
                    </span>
                    <div className="space-y-1">
                      {rule.conditions.map((c, i) => (
                        <div
                          key={i}
                          className="font-mono text-[11px] p-1.5 rounded bg-white border border-slate-200 text-slate-800"
                        >
                          {c.fact} <strong>{c.operator}</strong> {c.value !== undefined ? JSON.stringify(c.value) : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consequent */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Consequent (THEN):
                    </span>
                    <div className="font-mono text-[11px] p-2 rounded bg-teal-50 text-teal-900 border border-teal-200 font-semibold">
                      {rule.conclusion.fact} = {JSON.stringify(rule.conclusion.value)}
                    </div>
                  </div>

                  {/* Rationale & Source */}
                  <div className="pt-1 border-t border-slate-200 space-y-1">
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Clinical Rationale:</strong> {rule.explanation}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>{rule.source}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
