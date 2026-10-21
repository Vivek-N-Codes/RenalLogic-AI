import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  GitBranch,
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { SafetyNotice } from './components/SafetyNotice';
import { InferenceSelector } from './components/InferenceSelector';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultsOverview } from './components/ResultsOverview';
import { TraceExplorer } from './components/TraceExplorer';
import { ReasoningGraph } from './components/ReasoningGraph';
import { CaseLaboratory } from './components/CaseLaboratory';
import { RulesExplorer } from './components/RulesExplorer';
import { PrintableReport } from './components/PrintableReport';
import { AboutModal } from './components/AboutModal';

import {
  assessPatient,
  fetchDemoCases,
  fetchGoals,
  fetchRules,
} from './services/api';
import type {
  AssessmentResponse,
  ClinicalInput,
  DemoCase,
  GoalOption,
  InferenceMode,
  KnowledgeRule,
} from './types';

const defaultInput: ClinicalInput = {
  egfr: 42.0,
  uacr: 120.0,
  chronicity_ge_3m: 'yes',
  diabetes: 'yes',
  hypertension: 'yes',
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mode, setMode] = useState<InferenceMode>('forward');
  const [inputs, setInputs] = useState<ClinicalInput>(defaultInput);
  const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);

  const [rules, setRules] = useState<KnowledgeRule[]>([]);
  const [rulesMetadata, setRulesMetadata] = useState<any>(null);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [demoCases, setDemoCases] = useState<DemoCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>('CASE_1');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        const [rulesRes, goalsRes, demoRes] = await Promise.all([
          fetchRules(),
          fetchGoals(),
          fetchDemoCases(),
        ]);

        setRules(rulesRes.rules || []);
        setRulesMetadata(rulesRes.metadata);
        setGoalOptions(goalsRes || []);
        if (goalsRes && goalsRes.length > 0) {
          setSelectedGoal(goalsRes[0]);
        }
        setDemoCases(demoRes || []);

        // Run default initial assessment
        const initialRes = await assessPatient(defaultInput, 'forward');
        setAssessment(initialRes);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to connect to backend engine.');
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  const handleRunInference = async (
    customInputs?: ClinicalInput,
    customMode?: InferenceMode,
    customGoal?: GoalOption
  ) => {
    const targetInput = customInputs || inputs;
    const targetMode = customMode || mode;
    const targetGoal = customGoal || selectedGoal;

    setIsLoading(true);
    setError(null);
    try {
      const res = await assessPatient(
        targetInput,
        targetMode,
        targetGoal?.fact,
        targetGoal?.value
      );
      setAssessment(res);
    } catch (err: any) {
      setError(err.message || 'Error occurred while running inference.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoCase = (demo: DemoCase, runMode: InferenceMode = 'forward') => {
    setActiveCaseId(demo.id);
    const newInputs: ClinicalInput = {
      egfr: demo.inputs.egfr,
      uacr: demo.inputs.uacr,
      chronicity_ge_3m: demo.inputs.chronicity_ge_3m,
      diabetes: demo.inputs.diabetes,
      hypertension: demo.inputs.hypertension,
    };
    setInputs(newInputs);
    setMode(runMode);

    const matchedGoal = goalOptions.find(
      (g) =>
        g.fact === demo.target_hypothesis.fact &&
        g.value === demo.target_hypothesis.value
    ) || {
      fact: demo.target_hypothesis.fact,
      value: demo.target_hypothesis.value,
      label: `${demo.target_hypothesis.fact} = ${String(demo.target_hypothesis.value)}`,
    };
    setSelectedGoal(matchedGoal);

    handleRunInference(newInputs, runMode, matchedGoal);
    setActiveTab('dashboard');
  };

  const handleResetForm = () => {
    const blank: ClinicalInput = {
      egfr: null,
      uacr: null,
      chronicity_ge_3m: 'unknown',
      diabetes: 'unknown',
      hypertension: 'unknown',
    };
    setInputs(blank);
    setActiveCaseId(null);
    handleRunInference(blank, mode, selectedGoal || undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Academic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setShowReportModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        rulesCount={rules.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Safety & Educational Use Notice */}
        <SafetyNotice />

        {/* Global Error Banner if API disconnected */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>
                <strong>System Notice:</strong> {error}
              </span>
            </div>
            <button
              onClick={() => handleRunInference()}
              className="px-3 py-1.5 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab 1: Dashboard & Assessment */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & Mode Selector (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <InferenceSelector
                mode={mode}
                setMode={(newMode) => {
                  setMode(newMode);
                  handleRunInference(inputs, newMode, selectedGoal || undefined);
                }}
                selectedGoal={selectedGoal}
                setSelectedGoal={(goal) => {
                  setSelectedGoal(goal);
                  if (mode === 'backward') {
                    handleRunInference(inputs, 'backward', goal);
                  }
                }}
                goalOptions={goalOptions}
              />

              <AssessmentForm
                inputs={inputs}
                setInputs={setInputs}
                onSubmit={() => handleRunInference()}
                isLoading={isLoading}
                onReset={handleResetForm}
                demoCases={demoCases}
                onSelectDemoCase={(demo) => handleSelectDemoCase(demo, mode)}
                mode={mode}
              />
            </div>

            {/* Right Column: Results & Diagnostic Summaries (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {assessment ? (
                <>
                  <ResultsOverview assessment={assessment} />

                  {/* Quick Trace Preview inside Dashboard */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-teal-600" />
                        Inference Snapshot ({assessment.fired_rules_count} rules fired)
                      </span>
                      <button
                        onClick={() => setActiveTab('trace')}
                        className="text-xs text-teal-700 font-semibold hover:underline"
                      >
                        Open Full Execution Trace &rarr;
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {assessment.rule_trace.slice(0, 4).map((r) => (
                        <div
                          key={r.step}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center">
                              {r.step}
                            </span>
                            <span className="font-mono text-teal-800 font-semibold text-[11px]">
                              {r.rule_id}
                            </span>
                            <span className="text-slate-700 font-medium text-xs truncate max-w-xs">
                              {r.rule_name}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            &rarr; {r.conclusion.fact}: <strong>{String(r.conclusion.value)}</strong>
                          </span>
                        </div>
                      ))}
                      {assessment.rule_trace.length > 4 && (
                        <p className="text-[11px] text-slate-400 text-center pt-1">
                          + {assessment.rule_trace.length - 4} more rules fired deterministically
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
                  Run inference or select a sample case to view assessment results.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Inference Trace */}
        {activeTab === 'trace' && assessment && (
          <TraceExplorer
            trace={assessment.rule_trace}
            unknownFacts={assessment.unknown_facts}
          />
        )}

        {/* Tab 3: Interactive Reasoning Graph */}
        {activeTab === 'graph' && assessment && (
          <ReasoningGraph
            graphData={assessment.graph_data}
            mode={assessment.mode}
          />
        )}

        {/* Tab 4: Test Case Laboratory */}
        {activeTab === 'laboratory' && (
          <CaseLaboratory
            demoCases={demoCases}
            onSelectCase={handleSelectDemoCase}
            activeCaseId={activeCaseId}
          />
        )}

        {/* Tab 5: Verified Knowledge Base Explorer */}
        {activeTab === 'rules' && (
          <RulesExplorer rules={rules} metadata={rulesMetadata} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">RenalLogic AI</span>
            <span>• An Explainable Expert System for CKD Risk Assessment</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>KDIGO 2024 Guidelines</span>
            <span>•</span>
            <span>Kleene 3-Valued Logic</span>
            <span>•</span>
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-teal-700 font-semibold hover:underline"
            >
              System Methodology
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showReportModal && assessment && (
        <PrintableReport
          assessment={assessment}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
    </div>
  );
};

export default App;
