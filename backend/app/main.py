"""
RenalLogic AI - FastAPI Service
Explainable Rule-Based Expert System for Chronic Kidney Disease Risk Assessment.
Endpoints for forward chaining, backward chaining, rule exploration, and demo cases.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from .engine import KnowledgeBase, WorkingMemory
from .forward_chaining import ForwardChainer
from .backward_chaining import BackwardChainer, GoalStatus
from .sample_cases import SAMPLE_CASES
from .schemas import (
    AssessmentResponse,
    ClinicalInputRequest,
    DemoCaseSchema,
    RuleSchema,
    TraceItemSchema,
)

app = FastAPI(
    title="RenalLogic AI API",
    description="Explainable Rule-Based Expert System for CKD Risk Assessment (KDIGO 2024)",
    version="1.0.0",
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Knowledge Base
KB_PATH = Path(__file__).parent / "knowledge_base.json"
knowledge_base = KnowledgeBase.load_from_file(KB_PATH)

SAFETY_DISCLAIMER = (
    "EDUCATIONAL NOTICE: RenalLogic AI is an educational expert-system prototype developed "
    "for academic evaluation in an Artificial Intelligence competition. It is NOT an approved "
    "medical device or diagnostic instrument. It does not provide medical diagnoses, treatment "
    "prescriptions, or clinical validation. All CKD evaluations require documented persistence "
    "(>= 3 months) and consultation with a licensed medical professional."
)

SOURCE_REFERENCES = [
    "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease (Kidney International Supplements)",
    "KDIGO 2024 CKD Risk Grid (Prognosis Matrix by eGFR and Albuminuria Categories)",
    "National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) - CKD Evaluation and Testing Guidance"
]

SUGGESTED_GOALS = [
    {
        "fact": "assessment_summary",
        "value": "Confirmed_CKD_Criteria_Met",
        "label": "Confirmed CKD Criteria Met (>3 mo duration + abnormal marker)",
    },
    {
        "fact": "assessment_summary",
        "value": "Abnormal_Markers_Chronicity_Unverified",
        "label": "Abnormal Markers with Chronicity Unverified (Repeat in 3 mo)",
    },
    {
        "fact": "assessment_summary",
        "value": "Acute_Kidney_Abnormality_Suspected",
        "label": "Acute Kidney Abnormality Suspected (Non-persistent / possible AKI)",
    },
    {
        "fact": "assessment_summary",
        "value": "No_Current_Laboratory_Evidence_of_CKD",
        "label": "No Current Laboratory Evidence of CKD (Normal Baseline)",
    },
    {
        "fact": "kdigo_risk_category",
        "value": "Very_High",
        "label": "KDIGO Risk: Very High (Red Zone)",
    },
    {
        "fact": "kdigo_risk_category",
        "value": "High",
        "label": "KDIGO Risk: High (Orange Zone)",
    },
    {
        "fact": "kdigo_risk_category",
        "value": "Moderate",
        "label": "KDIGO Risk: Moderate (Yellow Zone)",
    },
    {
        "fact": "nephrology_referral_indicated",
        "value": True,
        "label": "Nephrology Referral Indicated (Stage G4/G5 or A3 albuminuria)",
    },
]


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "system": "RenalLogic AI",
        "version": knowledge_base.metadata.get("version", "1.0.0"),
        "rules_count": len(knowledge_base.rules),
        "guidelines": knowledge_base.metadata.get("guidelines", []),
    }


@app.get("/api/rules")
def get_rules() -> Dict[str, Any]:
    return {
        "metadata": knowledge_base.metadata,
        "rules_count": len(knowledge_base.rules),
        "rules": [r.to_dict() for r in knowledge_base.rules],
    }


@app.get("/api/goals")
def get_suggested_goals() -> List[Dict[str, Any]]:
    return SUGGESTED_GOALS


@app.get("/api/demo-cases", response_model=List[DemoCaseSchema])
def get_demo_cases() -> List[Dict[str, Any]]:
    return SAMPLE_CASES


@app.post("/api/demo-cases")
def query_demo_cases(case_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if case_id:
        matched = [c for c in SAMPLE_CASES if c["id"] == case_id]
        if not matched:
            raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' not found.")
        return matched
    return SAMPLE_CASES


@app.post("/api/assess", response_model=AssessmentResponse)
def assess_patient(payload: ClinicalInputRequest) -> AssessmentResponse:
    # 1. Prepare raw inputs dictionary
    raw_inputs: Dict[str, Any] = {
        "egfr": payload.egfr,
        "uacr": payload.uacr,
        "chronicity_ge_3m": payload.chronicity_ge_3m,
        "diabetes": payload.diabetes,
        "hypertension": payload.hypertension,
    }

    # 2. Forward Chaining Execution (Data-driven deduction)
    forward_chainer = ForwardChainer(knowledge_base)
    fc_result = forward_chainer.run(raw_inputs)
    wm = fc_result.working_memory

    # 3. Backward Chaining Execution if requested or target hypothesis supplied
    goal_status = None
    goal_explanation = None
    proof_tree_dict = None
    missing_facts: List[str] = []
    active_graph = fc_result.graph_data

    target_fact = payload.target_fact
    target_value = payload.target_value

    raw_wm = WorkingMemory()
    for k, v in raw_inputs.items():
        raw_wm.set_user_fact(k, v)

    if payload.mode == "backward":
        # Default hypothesis if not provided
        if not target_fact:
            target_fact = "assessment_summary"
            target_value = "Confirmed_CKD_Criteria_Met"

        backward_chainer = BackwardChainer(knowledge_base)
        bc_result = backward_chainer.verify_hypothesis(
            target_fact=target_fact,
            target_value=target_value,
            working_memory=raw_wm.clone(),
        )

        goal_status = bc_result.status.value
        goal_explanation = bc_result.explanation
        proof_tree_dict = bc_result.proof_tree.to_dict()
        missing_facts = bc_result.missing_facts
        # For backward mode, the primary reasoning graph represents the goal proof tree
        active_graph = bc_result.graph_data
    elif target_fact:
        # User ran forward chaining but also asked to check a specific goal hypothesis
        backward_chainer = BackwardChainer(knowledge_base)
        bc_result = backward_chainer.verify_hypothesis(
            target_fact=target_fact,
            target_value=target_value,
            working_memory=raw_wm.clone(),
        )
        goal_status = bc_result.status.value
        goal_explanation = bc_result.explanation
        proof_tree_dict = bc_result.proof_tree.to_dict()
        missing_facts = bc_result.missing_facts

    trace_schemas = [
        TraceItemSchema(
            step=t.step,
            rule_id=t.rule_id,
            rule_name=t.rule_name,
            category=t.category,
            matched_conditions=t.matched_conditions,
            conclusion=t.conclusion,
            explanation=t.explanation,
            source=t.source,
        )
        for t in fc_result.trace
    ]

    return AssessmentResponse(
        mode=payload.mode,
        assessment_summary=wm.derived_facts.get("assessment_summary"),
        kdigo_risk_category=wm.derived_facts.get("kdigo_risk_category"),
        chronicity_status=wm.derived_facts.get("chronicity_status"),
        egfr_stage=wm.derived_facts.get("egfr_stage"),
        uacr_stage=wm.derived_facts.get("uacr_stage"),
        nephrology_referral_indicated=wm.derived_facts.get("nephrology_referral_indicated"),
        recommended_monitoring_frequency=wm.derived_facts.get("recommended_monitoring_frequency"),
        primary_etiological_risk=wm.derived_facts.get("diabetic_nephropathy_risk"),
        hypertensive_risk_factor=wm.derived_facts.get("hypertensive_risk_factor"),
        goal_status=goal_status,
        goal_explanation=goal_explanation,
        target_fact=target_fact,
        target_value=target_value,
        supplied_facts=wm.user_facts,
        derived_facts=wm.derived_facts,
        unknown_facts=sorted(list(wm.unknown_facts)),
        missing_facts=missing_facts,
        rule_trace=trace_schemas,
        fired_rules_count=len(fc_result.trace),
        proof_tree=proof_tree_dict,
        graph_data=active_graph,
        knowledge_base_version=knowledge_base.metadata.get("version", "1.0.0"),
        review_status=knowledge_base.metadata.get("review_status", "verified_against_kdigo_2024"),
        source_references=SOURCE_REFERENCES,
        safety_disclaimer=SAFETY_DISCLAIMER,
    )
