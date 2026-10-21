import React from 'react';
import { Compass, Target } from 'lucide-react';
import type { GoalOption, InferenceMode } from '../types';

interface InferenceSelectorProps {
  mode: InferenceMode;
  setMode: (mode: InferenceMode) => void;
  selectedGoal: GoalOption | null;
  setSelectedGoal: (goal: GoalOption) => void;
  goalOptions: GoalOption[];
}

export const InferenceSelector: React.FC<InferenceSelectorProps> = ({
  mode,
  setMode,
  selectedGoal,
  setSelectedGoal,
  goalOptions,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            Inference Architecture Mode
          </h2>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Classical AI Reasoning
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Select between data-driven bottom-up synthesis or hypothesis-driven top-down verification.
        </p>
      </div>

      {/* Mode Toggle Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Forward Chaining Card */}
        <button
          type="button"
          onClick={() => setMode('forward')}
          className={`text-left p-3.5 rounded-lg border transition-all relative ${
            mode === 'forward'
              ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/30'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${mode === 'forward' ? 'bg-teal-600' : 'bg-slate-300'}`} />
              <span className="font-semibold text-xs text-slate-900">
                Forward Chaining
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-100/80 px-1.5 py-0.5 rounded">
              Data-Driven
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Supplied clinical facts initialize Working Memory. Rules fire when premises are satisfied, iteratively deriving GFR stage, albuminuria, and KDIGO risk until quiescence.
          </p>
        </button>

        {/* Backward Chaining Card */}
        <button
          type="button"
          onClick={() => setMode('backward')}
          className={`text-left p-3.5 rounded-lg border transition-all relative ${
            mode === 'backward'
              ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500/30'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${mode === 'backward' ? 'bg-teal-600' : 'bg-slate-300'}`} />
              <span className="font-semibold text-xs text-slate-900">
                Backward Chaining
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded">
              Goal-Driven
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Target hypothesis is evaluated recursively. Candidate rules are searched, premises decomposed into subgoals, loop detection applied, and missing facts explicitly flagged.
          </p>
        </button>
      </div>

      {/* Backward Chaining Goal Selector */}
      {mode === 'backward' && (
        <div className="mt-3 p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Target Clinical Hypothesis to Prove or Disprove:
            </label>
            <span className="text-[10px] text-indigo-700 font-mono">
              3-Valued Kleene Proof
            </span>
          </div>
          <select
            value={selectedGoal ? `${selectedGoal.fact}:${selectedGoal.value}` : ''}
            onChange={(e) => {
              const matched = goalOptions.find(
                (g) => `${g.fact}:${g.value}` === e.target.value
              );
              if (matched) setSelectedGoal(matched);
            }}
            className="w-full text-xs bg-white border border-indigo-300 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {goalOptions.map((g) => (
              <option key={`${g.fact}:${g.value}`} value={`${g.fact}:${g.value}`}>
                {g.label} ({g.fact} = {String(g.value)})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-indigo-800/80">
            Engine will recursively prove whether this target is <strong>SUPPORTED</strong>, <strong>NOT_SUPPORTED</strong>, or <strong>UNDETERMINED</strong> without assuming missing facts are false.
          </p>
        </div>
      )}
    </div>
  );
};
