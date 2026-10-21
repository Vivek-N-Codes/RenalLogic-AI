import React from 'react';
import {
  BookOpen,
  FlaskConical,
  Play,
  ShieldCheck,
  Target,
} from 'lucide-react';
import type { DemoCase } from '../types';

interface CaseLaboratoryProps {
  demoCases: DemoCase[];
  onSelectCase: (demo: DemoCase, mode: 'forward' | 'backward') => void;
  activeCaseId: string | null;
}

export const CaseLaboratory: React.FC<CaseLaboratoryProps> = ({
  demoCases,
  onSelectCase,
  activeCaseId,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-600" />
            Clinical Test Case Laboratory
          </h2>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            8 Academic Benchmarks
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Curated scenarios covering edge cases, missing data handling, 3-month chronicity verification, and KDIGO 2024 risk stratification.
        </p>
      </div>

      {/* Grid of Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoCases.map((c) => {
          const isActive = activeCaseId === c.id;
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 transition-all space-y-3 flex flex-col justify-between ${
                isActive
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-2">
                {/* Case Top Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {c.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {c.description}
                </p>

                {/* Expected AI Behavior */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Expected Software Behavior:
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {c.expected_behavior}
                  </p>
                </div>

                {/* Educational Note */}
                <div className="text-[11px] text-teal-900/80 flex items-start gap-1.5 pt-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{c.educational_notes}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {c.target_hypothesis.fact}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectCase(c, 'forward')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Run Forward
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectCase(c, 'backward')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <Target className="w-3 h-3 text-indigo-600" />
                    Prove Goal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
