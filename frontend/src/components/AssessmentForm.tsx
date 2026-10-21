import React from 'react';
import {
  Activity,
  FlaskConical,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { ClinicalInput, DemoCase, TriStateOption } from '../types';

interface AssessmentFormProps {
  inputs: ClinicalInput;
  setInputs: React.Dispatch<React.SetStateAction<ClinicalInput>>;
  onSubmit: () => void;
  isLoading: boolean;
  onReset: () => void;
  demoCases: DemoCase[];
  onSelectDemoCase: (demo: DemoCase) => void;
  mode: string;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  inputs,
  setInputs,
  onSubmit,
  isLoading,
  onReset,
  demoCases,
  onSelectDemoCase,
  mode,
}) => {
  const handleEgfrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === '') {
      setInputs((prev) => ({ ...prev, egfr: null }));
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, egfr: num }));
      }
    }
  };

  const handleUacrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === '') {
      setInputs((prev) => ({ ...prev, uacr: null }));
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, uacr: num }));
      }
    }
  };

  const renderTriStateToggle = (
    label: string,
    currentVal: TriStateOption,
    onChange: (val: TriStateOption) => void,
    helperText?: string
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800">{label}</label>
          <span className="text-[10px] text-slate-400">Tri-state truth value</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['yes', 'no', 'unknown'] as TriStateOption[]).map((opt) => {
            const isSelected = currentVal === opt;
            const labels: Record<TriStateOption, string> = {
              yes: 'Yes (Present)',
              no: 'No (Absent)',
              unknown: 'Unknown (Missing)',
            };
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`text-xs py-1.5 px-2 rounded-md font-medium transition-all ${
                  isSelected
                    ? opt === 'yes'
                      ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                      : opt === 'no'
                      ? 'bg-slate-700 text-white shadow-2xs font-semibold'
                      : 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {labels[opt]}
              </button>
            );
          })}
        </div>
        {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header and Quick Case Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Patient Clinical Input
          </h2>
          <p className="text-xs text-slate-500">
            Validated laboratory measurements and chronicity parameters
          </p>
        </div>

        {/* Demo Cases Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
            Load Sample:
          </span>
          <select
            onChange={(e) => {
              const selected = demoCases.find((c) => c.id === e.target.value);
              if (selected) onSelectDemoCase(selected);
            }}
            defaultValue=""
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="" disabled>Select Curated Scenario...</option>
            {demoCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="space-y-4">
        {/* eGFR Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              Estimated GFR (eGFR)
              <span className="text-[11px] font-normal text-slate-500">
                (mL/min/1.73 m²)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setInputs((p) => ({ ...p, egfr: null }))}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
            >
              Clear to Unknown
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="250"
              value={inputs.egfr !== null ? inputs.egfr : ''}
              onChange={handleEgfrChange}
              placeholder="e.g. 42 (Leave empty if unknown)"
              className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>Normal/G1: &ge;90</span>
            <span>G2: 60-89</span>
            <span>G3a: 45-59</span>
            <span>G3b: 30-44</span>
            <span>G4: 15-29</span>
            <span>G5: &lt;15</span>
          </div>
        </div>

        {/* UACR Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              Urine Albumin-to-Creatinine Ratio (UACR)
              <span className="text-[11px] font-normal text-slate-500">
                (mg/g)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setInputs((p) => ({ ...p, uacr: null }))}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
            >
              Clear to Unknown
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5000"
              value={inputs.uacr !== null ? inputs.uacr : ''}
              onChange={handleUacrChange}
              placeholder="e.g. 120 (Leave empty if unknown)"
              className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>A1 (Normal to Mild): &lt;30 mg/g</span>
            <span>A2 (Moderate): 30-300 mg/g</span>
            <span>A3 (Severe): &gt;300 mg/g</span>
          </div>
        </div>

        {/* Chronicity >= 3 Months */}
        {renderTriStateToggle(
          'Chronicity: Abnormality Documented Persisting for >= 3 Months?',
          inputs.chronicity_ge_3m,
          (val) => setInputs((p) => ({ ...p, chronicity_ge_3m: val })),
          'KDIGO 2024 requires abnormalities of kidney function/structure to persist > 3 months to confirm CKD diagnosis.'
        )}

        {/* Diabetes History */}
        {renderTriStateToggle(
          'Diabetes Mellitus History',
          inputs.diabetes,
          (val) => setInputs((p) => ({ ...p, diabetes: val })),
          'Primary etiology for diabetic kidney disease.'
        )}

        {/* Hypertension History */}
        {renderTriStateToggle(
          'Systemic Hypertension History',
          inputs.hypertension,
          (val) => setInputs((p) => ({ ...p, hypertension: val })),
          'Primary acceleration factor for cardiorenal decline.'
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset Form
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Running Inference Engine...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {mode === 'forward' ? 'Run Forward Chaining' : 'Prove Hypothesis (Backward)'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
