import type {
  AssessmentResponse,
  ClinicalInput,
  DemoCase,
  GoalOption,
  InferenceMode,
  KnowledgeRule,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch API health status');
  return res.json();
}

export async function fetchRules(): Promise<{
  metadata: any;
  rules_count: number;
  rules: KnowledgeRule[];
}> {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to fetch knowledge base rules');
  return res.json();
}

export async function fetchGoals(): Promise<GoalOption[]> {
  const res = await fetch(`${API_BASE}/goals`);
  if (!res.ok) throw new Error('Failed to fetch suggested goals');
  return res.json();
}

export async function fetchDemoCases(): Promise<DemoCase[]> {
  const res = await fetch(`${API_BASE}/demo-cases`);
  if (!res.ok) throw new Error('Failed to fetch demo cases');
  return res.json();
}

export async function assessPatient(
  inputs: ClinicalInput,
  mode: InferenceMode,
  target_fact?: string,
  target_value?: any
): Promise<AssessmentResponse> {
  const payload = {
    mode,
    egfr: inputs.egfr,
    uacr: inputs.uacr,
    chronicity_ge_3m: inputs.chronicity_ge_3m,
    diabetes: inputs.diabetes,
    hypertension: inputs.hypertension,
    target_fact: target_fact || inputs.target_fact,
    target_value: target_value !== undefined ? target_value : inputs.target_value,
  };

  const res = await fetch(`${API_BASE}/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server error: ${res.statusText}`);
  }

  return res.json();
}
