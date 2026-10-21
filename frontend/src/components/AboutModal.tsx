import React from 'react';
import {
  Activity,
  BookOpen,
  Cpu,
  GitBranch,
  ShieldAlert,
  X,
} from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 animate-in fade-in zoom-in-95 cursor-default flex flex-col my-auto max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                RenalLogic AI: System Architecture & Methodology
              </h2>
              <p className="text-xs text-slate-400">
                Academic AI Competition Mini-Project Documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto flex-1">
          {/* Executive Summary */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              1. Project Objective
            </h3>
            <p className="leading-relaxed">
              <strong>RenalLogic AI</strong> is an explainable, classical rule-based expert system developed for
              an Artificial Intelligence subject competition. It demonstrates genuine symbolic AI concepts—declarative knowledge representation,
              working memory management, 3-valued Kleene logic for unknown facts, forward chaining (data-driven deduction), and backward chaining
              (goal-driven proof tree verification)—applied to Chronic Kidney Disease (CKD) risk stratification.
            </p>
          </div>

          {/* AI Core Concepts */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              2. Core Classical AI Engine Mechanisms
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">
                  A. Declarative Knowledge Representation & Working Memory
                </span>
                <p className="leading-relaxed text-slate-600">
                  Medical domain knowledge is decoupled entirely from code and stored in a version-controlled JSON rule base.
                  Working Memory explicitly tracks <strong>User-Supplied Facts</strong>, <strong>Derived Facts</strong>, and <strong>Unknown Facts</strong>.
                  Missing inputs are never silently converted into false; they are tracked under Kleene 3-valued logic.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">
                  B. Forward Chaining (Data-Driven Deduction)
                </span>
                <p className="leading-relaxed text-slate-600">
                  Employs the classical Match-Resolve-Act cycle. The agenda resolves rule conflicts deterministically using rule priority tiers
                  and rule IDs. Execution fires iteratively until working memory reaches quiescence. Full execution traces are recorded with matched condition evaluations.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">
                  C. Backward Chaining (Goal-Driven Hypothesis Prover)
                </span>
                <p className="leading-relaxed text-slate-600">
                  Recursively evaluates candidate rules that establish a target hypothesis. It maintains an active goal stack to detect circular loops,
                  constructs proof trees, and returns explicit three-valued status: <code>SUPPORTED</code>, <code>NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE</code>, or <code>UNDETERMINED</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical KDIGO 2024 Foundations */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              3. Authoritative Medical Scope & KDIGO 2024
            </h3>
            <p className="leading-relaxed">
              Rules strictly reflect the <strong>KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>The &ge; 3 Months Chronicity Rule:</strong> A single abnormal laboratory reading (eGFR &lt; 60 or UACR &ge; 30) does NOT confirm CKD.
                The engine distinguishes confirmed persistent CKD from acute kidney injury (AKI) or transient proteinuria.
              </li>
              <li>
                <strong>CGA Staging & Prognosis Grid:</strong> Incorporates 6 eGFR categories (G1 to G5) and 3 Albuminuria categories (A1 to A3) to derive the composite KDIGO heat map risk level.
              </li>
              <li>
                <strong>Nephrology Referral Thresholds:</strong> Flags stage G4/G5 (eGFR &lt; 30) or severe albuminuria (A3 &gt; 300 mg/g) for specialist consultation.
              </li>
            </ul>
          </div>

          {/* Safety & Limitations */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 border-t border-slate-100">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>4. Safety, Limitations & Ethical Boundaries</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px]">
              <li>This software is an educational prototype and is NOT a medical device.</li>
              <li>It does not prescribe medications, recommend dosages, or claim clinical diagnostic validation.</li>
              <li>No arbitrary statistical probabilities or black-box neural confidence scores are invented.</li>
              <li>No real patient identifiers are collected, transmitted, or stored.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
