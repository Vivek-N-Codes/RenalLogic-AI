import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Stethoscope,
  Target,
} from 'lucide-react';
import type { AssessmentResponse } from '../types';

interface ResultsOverviewProps {
  assessment: AssessmentResponse;
}

export const ResultsOverview: React.FC<ResultsOverviewProps> = ({ assessment }) => {
  const {
    mode,
    assessment_summary,
    kdigo_risk_category,
    chronicity_status,
    egfr_stage,
    uacr_stage,
    nephrology_referral_indicated,
    recommended_monitoring_frequency,
    primary_etiological_risk,
    hypertensive_risk_factor,
    goal_status,
    goal_explanation,
    target_fact,
    target_value,
    supplied_facts,
    derived_facts,
    unknown_facts,
    missing_facts,
    fired_rules_count,
  } = assessment;

  // Format human-readable summary title
  const getSummaryDisplay = () => {
    switch (assessment_summary) {
      case 'Confirmed_CKD_Criteria_Met':
        return {
          title: 'Confirmed Chronic Kidney Disease (Criteria Met)',
          description:
            'Objective functional or structural renal abnormalities documented persisting for >= 3 months under KDIGO 2024 criteria.',
          color: 'bg-rose-50 border-rose-300 text-rose-950',
          badgeColor: 'bg-rose-600 text-white',
          icon: AlertCircle,
        };
      case 'Abnormal_Markers_Chronicity_Unverified':
        return {
          title: 'Abnormal Markers Present (Chronicity Unverified)',
          description:
            'Filtration impairment or albuminuria detected. Unknown persistence prevents formal CKD diagnosis; repeat testing in 3 months is necessary.',
          color: 'bg-amber-50 border-amber-300 text-amber-950',
          badgeColor: 'bg-amber-600 text-white',
          icon: Clock,
        };
      case 'Acute_Kidney_Abnormality_Suspected':
        return {
          title: 'Acute Kidney Abnormality Suspected (Non-Persistent)',
          description:
            'Renal abnormality has NOT persisted for 3 months. KDIGO guidelines require rule-out of Acute Kidney Injury (AKI) or transient factors rather than CKD.',
          color: 'bg-orange-50 border-orange-300 text-orange-950',
          badgeColor: 'bg-orange-600 text-white',
          icon: AlertTriangle,
        };
      case 'No_Current_Laboratory_Evidence_of_CKD':
        return {
          title: 'Normal Reference Baseline',
          description:
            'Glomerular filtration rate and urinary albumin excretion fall within normal reference intervals with no biochemical markers of kidney damage.',
          color: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badgeColor: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
        };
      default:
        return {
          title: 'Evaluation Inconclusive (Incomplete Data)',
          description:
            'Essential laboratory parameters (eGFR or UACR) were not supplied. Reasoning engine cannot assign risk tier without objective measurements.',
          color: 'bg-slate-50 border-slate-300 text-slate-800',
          badgeColor: 'bg-slate-600 text-white',
          icon: HelpCircle,
        };
    }
  };

  const summaryMeta = getSummaryDisplay();
  const SummaryIcon = summaryMeta.icon;

  const getRiskBadge = () => {
    switch (kdigo_risk_category) {
      case 'Low':
        return { label: 'Low Risk (Green Zone)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'Moderate':
        return { label: 'Moderately Increased (Yellow Zone)', bg: 'bg-yellow-100 text-yellow-900 border-yellow-300' };
      case 'High':
        return { label: 'High Risk (Orange Zone)', bg: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'Very_High':
        return { label: 'Very High Risk (Red Zone)', bg: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { label: 'Risk Not Assessable', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const riskBadge = getRiskBadge();

  return (
    <div className="space-y-5">
      {/* Primary Clinical Summary Banner */}
      <div className={`p-5 rounded-xl border ${summaryMeta.color} shadow-xs transition-all`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white/80 shadow-2xs mt-0.5">
              <SummaryIcon className="w-5 h-5 text-current" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold tracking-tight">
                  {summaryMeta.title}
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${riskBadge.bg}`}>
                  {riskBadge.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
                {summaryMeta.description}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Inference Mode
            </span>
            <span className="text-xs font-semibold text-slate-800 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
              {mode === 'forward' ? 'Forward Chaining' : 'Backward Chaining'}
            </span>
          </div>
        </div>
      </div>

      {/* Backward Chaining Proof Status Banner (If backward or hypothesis queried) */}
      {goal_status && (
        <div className="p-4 rounded-xl border bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hypothesis Verification Proof Status
              </span>
            </div>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                goal_status === 'SUPPORTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : goal_status === 'NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {goal_status}
            </span>
          </div>

          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-0.5">
              Target Goal: [{target_fact} = {String(target_value)}]
            </p>
            <p>{goal_explanation}</p>
          </div>

          {missing_facts && missing_facts.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Missing Premises:</strong> [{missing_facts.join(', ')}]. Under 3-valued Kleene logic, unasserted data cannot be assumed false.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Key Staging & Recommendations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* eGFR Stage Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              eGFR Stage
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {egfr_stage || 'Unknown'}
            </span>
          </div>
          <p className="text-xs text-slate-800 font-medium">
            {egfr_stage === 'G1' && 'Normal or High (>=90)'}
            {egfr_stage === 'G2' && 'Mildly Decreased (60-89)'}
            {egfr_stage === 'G3a' && 'Mildly to Moderately Decreased (45-59)'}
            {egfr_stage === 'G3b' && 'Moderately to Severely Decreased (30-44)'}
            {egfr_stage === 'G4' && 'Severely Decreased (15-29)'}
            {egfr_stage === 'G5' && 'Kidney Failure (<15)'}
            {!egfr_stage && 'Input not provided'}
          </p>
        </div>

        {/* Albuminuria Stage Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Albuminuria Stage
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {uacr_stage || 'Unknown'}
            </span>
          </div>
          <p className="text-xs text-slate-800 font-medium">
            {uacr_stage === 'A1' && 'Normal to Mildly Increased (<30 mg/g)'}
            {uacr_stage === 'A2' && 'Moderately Increased (30-300 mg/g)'}
            {uacr_stage === 'A3' && 'Severely Increased (>300 mg/g)'}
            {!uacr_stage && 'Input not provided'}
          </p>
        </div>

        {/* Chronicity Status Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Chronicity Status
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {chronicity_status === 'Confirmed_Persistent' && 'Confirmed (>= 3 Months)'}
            {chronicity_status === 'Unknown_Persistence' && 'Unverified (Retest at 3 Mo)'}
            {chronicity_status === 'Acute_or_Unconfirmed' && 'Acute / Non-Persistent'}
            {chronicity_status === 'Not_Applicable_Normal_Markers' && 'N/A (Normal Markers)'}
            {!chronicity_status && 'Pending Laboratory Input'}
          </p>
          <span className="text-[10px] text-slate-500">KDIGO Duration Rule</span>
        </div>

        {/* Nephrology Referral Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Referral Trigger
            </span>
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p
            className={`text-xs font-bold ${
              nephrology_referral_indicated
                ? 'text-rose-700'
                : 'text-slate-700'
            }`}
          >
            {nephrology_referral_indicated
              ? 'Nephrology Referral Indicated'
              : 'Routine Primary Care Follow-up'}
          </p>
          <span className="text-[10px] text-slate-500">
            {nephrology_referral_indicated
              ? 'Triggered by Stage G4/G5 or A3'
              : 'Does not exceed acute referral threshold'}
          </span>
        </div>
      </div>

      {/* Surveillance & Etiological Modifiers Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          Surveillance & Clinical Action Directives
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Recommended Monitoring Frequency
            </span>
            <p className="font-semibold text-slate-900">
              {recommended_monitoring_frequency || 'Annual Routine Check'}
            </p>
            <p className="text-[11px] text-slate-500">Based on composite risk cell</p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Diabetic Nephropathy Risk
            </span>
            <p className="font-semibold text-slate-900">
              {primary_etiological_risk
                ? 'Elevated Diabetic Etiology'
                : 'No Diabetes Reported'}
            </p>
            <p className="text-[11px] text-slate-500">Accelerates microvascular decline</p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Cardiovascular / HTN Risk
            </span>
            <p className="font-semibold text-slate-900">
              {hypertensive_risk_factor
                ? 'Hypertensive Comorbidity Present'
                : 'No HTN Reported'}
            </p>
            <p className="text-[11px] text-slate-500">Blood pressure control guideline</p>
          </div>
        </div>
      </div>

      {/* Working Memory State Pills */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Working Memory State ({Object.keys(derived_facts).length} derived facts, {fired_rules_count} rules fired)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Deterministic Quiescence
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.entries(supplied_facts).map(([k, v]) => (
            <span
              key={`user_${k}`}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {k}: <strong className="text-slate-950">{String(v)}</strong>
            </span>
          ))}
          {Object.entries(derived_facts).map(([k, v]) => (
            <span
              key={`derived_${k}`}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-300 font-mono font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              {k}: <strong className="text-teal-950">{String(v)}</strong>
            </span>
          ))}
          {unknown_facts.map((k) => (
            <span
              key={`unk_${k}`}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {k}: <em>UNKNOWN</em>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
