export type InferenceMode = 'forward' | 'backward';

export type TriStateOption = 'yes' | 'no' | 'unknown';

export interface ClinicalInput {
  egfr: number | null;
  uacr: number | null;
  chronicity_ge_3m: TriStateOption;
  diabetes: TriStateOption;
  hypertension: TriStateOption;
  target_fact?: string;
  target_value?: any;
}

export interface MatchedCondition {
  fact: string;
  operator: string;
  required_value: any;
  actual_value: any;
  satisfied?: boolean;
}

export interface TraceItem {
  step: number;
  rule_id: string;
  rule_name: string;
  category: string;
  matched_conditions: MatchedCondition[];
  conclusion: {
    fact: string;
    value: any;
  };
  explanation: string;
  source: string;
}

export interface ProofNode {
  fact: string;
  target_value: any;
  status: 'SUPPORTED' | 'NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE' | 'UNDETERMINED';
  reason: string;
  rule_id?: string;
  rule_name?: string;
  unresolved_premises?: Array<{
    fact: string;
    condition: string;
    reason: string;
  }>;
  children: ProofNode[];
}

export interface AssessmentResponse {
  mode: InferenceMode;
  assessment_summary?: string;
  kdigo_risk_category?: 'Low' | 'Moderate' | 'High' | 'Very_High';
  chronicity_status?: string;
  egfr_stage?: string;
  uacr_stage?: string;
  nephrology_referral_indicated?: boolean;
  recommended_monitoring_frequency?: string;
  primary_etiological_risk?: string;
  hypertensive_risk_factor?: string;
  goal_status?: 'SUPPORTED' | 'NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE' | 'UNDETERMINED';
  goal_explanation?: string;
  target_fact?: string;
  target_value?: any;
  supplied_facts: Record<string, any>;
  derived_facts: Record<string, any>;
  unknown_facts: string[];
  missing_facts: string[];
  rule_trace: TraceItem[];
  fired_rules_count: number;
  proof_tree?: ProofNode;
  graph_data: {
    nodes: any[];
    edges: any[];
  };
  knowledge_base_version: string;
  review_status: string;
  source_references: string[];
  safety_disclaimer: string;
}

export interface DemoCase {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  inputs: {
    egfr: number | null;
    uacr: number | null;
    chronicity_ge_3m: TriStateOption;
    diabetes: TriStateOption;
    hypertension: TriStateOption;
  };
  target_hypothesis: {
    fact: string;
    value: any;
  };
  description: string;
  expected_behavior: string;
  educational_notes: string;
}

export interface GoalOption {
  fact: string;
  value: any;
  label: string;
}

export interface KnowledgeRule {
  id: string;
  name: string;
  category: string;
  priority: number;
  conditions: Array<{
    fact: string;
    operator: string;
    value?: any;
  }>;
  conclusion: {
    fact: string;
    value: any;
  };
  explanation: string;
  source: string;
  review_status: string;
}
