import React from 'react';
import {
  Activity,
  ArrowLeft,
  Download,
  Printer,
  X,
} from 'lucide-react';
import type { AssessmentResponse } from '../types';

interface PrintableReportProps {
  assessment: AssessmentResponse;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  assessment,
  onClose,
}) => {
  // Generate a reproducible case identifier
  const reportId = React.useMemo(() => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `RL-2026-${randomHex}`;
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(assessment, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${reportId}-clinical-assessment.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 cursor-pointer print:p-0 print:static print:bg-transparent print:overflow-visible"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 cursor-default flex flex-col my-auto max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:my-0 print:rounded-none"
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors mr-1 border border-slate-700"
              title="Return to Dashboard (or press Esc / click outside)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return</span>
            </button>
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs uppercase tracking-wider hidden sm:inline">
              Printable Assessment Summary
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Download structured assessment data as JSON"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-500 text-xs font-semibold shadow-xs transition-colors"
              title="Print or choose 'Save as PDF' in the destination dropdown"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white overflow-y-auto flex-1" id="printable-area">
          {/* Document Header */}
          <div className="border-b-2 border-teal-700 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  RenalLogic <span className="text-teal-700">AI</span>
                </span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2 py-0.5 rounded uppercase">
                  Academic Expert System
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Explainable Rule-Based Clinical Decision Support Prototype • KDIGO 2024 Guidelines
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono font-bold text-slate-800">Case ID: {reportId}</p>
              <p className="text-slate-500">{currentDate}</p>
              <p className="text-[10px] text-slate-400">Deterministic Rule Trace</p>
            </div>
          </div>

          {/* Clinical Findings Headline */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Evaluation Synthesis
              </span>
              <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-teal-700 text-white">
                KDIGO: {assessment.kdigo_risk_category || 'Indeterminate'} Risk
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {assessment.assessment_summary?.replace(/_/g, ' ') || 'Evaluation Inconclusive'}
            </h3>
            <p className="text-xs text-slate-600">
              Chronicity status: <strong>{assessment.chronicity_status?.replace(/_/g, ' ') || 'Unknown'}</strong>.
              {assessment.nephrology_referral_indicated && ' • Nephrology referral threshold exceeded.'}
            </p>
          </div>

          {/* Input Laboratory Profile */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-100 pb-1">
              1. Supplied Patient Observations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Estimated GFR</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {assessment.supplied_facts.egfr !== undefined ? `${assessment.supplied_facts.egfr} mL/min/1.73m²` : 'UNKNOWN'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Urine Albumin/Creatinine</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {assessment.supplied_facts.uacr !== undefined ? `${assessment.supplied_facts.uacr} mg/g` : 'UNKNOWN'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Chronicity &ge; 3 Months</span>
                <span className="font-mono font-bold text-slate-900 text-sm capitalize">
                  {assessment.supplied_facts.chronicity_ge_3m || 'UNKNOWN'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Diabetes Mellitus</span>
                <span className="font-mono font-bold text-slate-900 text-sm capitalize">
                  {assessment.supplied_facts.diabetes || 'UNKNOWN'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Systemic Hypertension</span>
                <span className="font-mono font-bold text-slate-900 text-sm capitalize">
                  {assessment.supplied_facts.hypertension || 'UNKNOWN'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Inference Engine Mode</span>
                <span className="font-mono font-bold text-teal-800 text-sm capitalize">
                  {assessment.mode} Chaining
                </span>
              </div>
            </div>
          </div>

          {/* Derived Findings Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-100 pb-1">
              2. Derived Staging & Clinical Classifications
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">eGFR Category</span>
                <p className="font-bold text-slate-900">{assessment.egfr_stage || 'Not Assigned'}</p>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Albuminuria Category</span>
                <p className="font-bold text-slate-900">{assessment.uacr_stage || 'Not Assigned'}</p>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Surveillance</span>
                <p className="font-bold text-slate-900">{assessment.recommended_monitoring_frequency || 'Routine'}</p>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Nephrology Referral</span>
                <p className="font-bold text-slate-900">
                  {assessment.nephrology_referral_indicated ? 'Indicated' : 'Not Triggered'}
                </p>
              </div>
            </div>
          </div>

          {/* Fired Rules Trace Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-100 pb-1">
              3. Transparent Production Rules Fired ({assessment.fired_rules_count})
            </h4>
            <div className="space-y-1.5 text-[11px]">
              {assessment.rule_trace.map((r) => (
                <div
                  key={r.step}
                  className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-mono font-bold text-teal-800 mr-2">[{r.rule_id}]</span>
                    <strong className="text-slate-900">{r.rule_name}</strong>
                    <p className="text-slate-600 text-[10px] mt-0.5">{r.explanation}</p>
                  </div>
                  <span className="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0 text-[10px]">
                    &rarr; {r.conclusion.fact}: {String(r.conclusion.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unknown Information / Missing Values */}
          {assessment.unknown_facts.length > 0 && (
            <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Explicitly Unasserted/Unknown Parameters:</strong> [{assessment.unknown_facts.join(', ')}].
              Per classical expert system rules, missing data was treated under Kleene 3-valued uncertainty and never assumed to be false.
            </div>
          )}

          {/* Authoritative References & Academic Disclaimer */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-[10px] text-slate-500">
            <div>
              <strong className="text-slate-700">Authoritative Guidelines:</strong>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {assessment.source_references.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded bg-slate-100 border border-slate-200 text-slate-600 leading-relaxed">
              <strong>EDUCATIONAL USE DISCLAIMER:</strong> {assessment.safety_disclaimer}
            </div>
          </div>
        </div>

        {/* Bottom Control Footer (Hidden when printing) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            Tip: In your browser&apos;s print preview, choose <strong className="text-slate-800">&quot;Save as PDF&quot;</strong> as destination to save a file.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-500 text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
