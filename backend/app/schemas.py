"""
RenalLogic AI - Pydantic Request & Response Schemas
Type-safe API contracts for clinical expert system evaluation.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ClinicalInputRequest(BaseModel):
    """Structured patient evaluation input."""
    mode: str = Field(default="forward", description="Inference mode: 'forward' or 'backward'")
    egfr: Optional[float] = Field(default=None, description="eGFR in mL/min/1.73 m²")
    uacr: Optional[float] = Field(default=None, description="Urine Albumin-to-Creatinine Ratio (UACR) in mg/g")
    chronicity_ge_3m: Optional[str] = Field(
        default="unknown",
        description="Persistence of abnormality >= 3 months: 'yes' | 'no' | 'unknown'"
    )
    diabetes: Optional[str] = Field(
        default="unknown",
        description="History of diabetes: 'yes' | 'no' | 'unknown'"
    )
    hypertension: Optional[str] = Field(
        default="unknown",
        description="History of hypertension: 'yes' | 'no' | 'unknown'"
    )
    # Backward chaining goal specification
    target_fact: Optional[str] = Field(default=None, description="Target hypothesis fact name")
    target_value: Optional[Any] = Field(default=None, description="Target hypothesis expected value")

    @field_validator("egfr")
    @classmethod
    def validate_egfr(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if v < 0 or v > 300:
                raise ValueError("eGFR must be between 0 and 300 mL/min/1.73 m²")
        return v

    @field_validator("uacr")
    @classmethod
    def validate_uacr(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if v < 0 or v > 10000:
                raise ValueError("UACR must be between 0 and 10,000 mg/g")
        return v


class RuleConditionSchema(BaseModel):
    fact: str
    operator: str
    value: Any = None


class RuleSchema(BaseModel):
    id: str
    name: str
    category: str
    priority: int
    conditions: List[RuleConditionSchema]
    conclusion: Dict[str, Any]
    explanation: str
    source: str
    review_status: str


class TraceItemSchema(BaseModel):
    step: int
    rule_id: str
    rule_name: str
    category: str
    matched_conditions: List[Dict[str, Any]]
    conclusion: Dict[str, Any]
    explanation: str
    source: str


class AssessmentResponse(BaseModel):
    """Complete, transparent assessment output."""
    mode: str
    assessment_summary: Optional[str] = None
    kdigo_risk_category: Optional[str] = None
    chronicity_status: Optional[str] = None
    egfr_stage: Optional[str] = None
    uacr_stage: Optional[str] = None
    nephrology_referral_indicated: Optional[bool] = None
    recommended_monitoring_frequency: Optional[str] = None
    primary_etiological_risk: Optional[str] = None
    hypertensive_risk_factor: Optional[str] = None

    goal_status: Optional[str] = None
    goal_explanation: Optional[str] = None
    target_fact: Optional[str] = None
    target_value: Optional[Any] = None

    supplied_facts: Dict[str, Any]
    derived_facts: Dict[str, Any]
    unknown_facts: List[str]
    missing_facts: List[str] = Field(default_factory=list)

    rule_trace: List[TraceItemSchema]
    fired_rules_count: int
    proof_tree: Optional[Dict[str, Any]] = None
    graph_data: Dict[str, Any]

    knowledge_base_version: str
    review_status: str
    source_references: List[str]
    safety_disclaimer: str


class DemoCaseSchema(BaseModel):
    id: str
    title: str
    subtitle: str
    category: str
    inputs: Dict[str, Any]
    target_hypothesis: Dict[str, Any]
    description: str
    expected_behavior: str
    educational_notes: str
