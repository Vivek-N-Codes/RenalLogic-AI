"""
Tests for Forward Chaining Data-Driven Inference Engine.
"""

from pathlib import Path
import pytest
from app.engine import KnowledgeBase
from app.forward_chaining import ForwardChainer

KB_PATH = Path(__file__).parent.parent / "app" / "knowledge_base.json"


@pytest.fixture
def knowledge_base():
    return KnowledgeBase.load_from_file(KB_PATH)


def test_forward_chaining_confirmed_ckd(knowledge_base):
    chainer = ForwardChainer(knowledge_base)
    inputs = {
        "egfr": 42.0,
        "uacr": 120.0,
        "chronicity_ge_3m": "yes",
        "diabetes": "yes",
        "hypertension": "yes",
    }
    result = chainer.run(inputs)

    assert result.success is True
    derived = result.derived_facts

    assert derived.get("egfr_stage") == "G3b"
    assert derived.get("uacr_stage") == "A2"
    assert derived.get("has_abnormal_gfr") is True
    assert derived.get("has_abnormal_acr") is True
    assert derived.get("has_abnormal_marker") is True
    assert derived.get("chronicity_status") == "Confirmed_Persistent"
    assert derived.get("kdigo_risk_category") == "Very_High"
    assert derived.get("assessment_summary") == "Confirmed_CKD_Criteria_Met"
    assert derived.get("diabetic_nephropathy_risk") == "Elevated_Diabetic_Etiology"

    # Verify trace order and structure
    assert len(result.trace) > 0
    step_numbers = [t.step for t in result.trace]
    assert step_numbers == list(range(1, len(result.trace) + 1))


def test_forward_chaining_normal_baseline(knowledge_base):
    chainer = ForwardChainer(knowledge_base)
    inputs = {
        "egfr": 105.0,
        "uacr": 12.0,
        "chronicity_ge_3m": "unknown",
        "diabetes": "no",
        "hypertension": "no",
    }
    result = chainer.run(inputs)

    derived = result.derived_facts
    assert derived.get("egfr_stage") == "G1"
    assert derived.get("uacr_stage") == "A1"
    assert derived.get("has_abnormal_marker") is False
    assert derived.get("chronicity_status") == "Not_Applicable_Normal_Markers"
    assert derived.get("kdigo_risk_category") == "Low"
    assert derived.get("assessment_summary") == "No_Current_Laboratory_Evidence_of_CKD"


def test_forward_chaining_unknown_facts_not_assumed_false(knowledge_base):
    chainer = ForwardChainer(knowledge_base)
    inputs = {
        "egfr": None,
        "uacr": None,
        "chronicity_ge_3m": "unknown",
        "diabetes": "yes",
    }
    result = chainer.run(inputs)

    # Staging rules for eGFR and UACR MUST NOT fire
    assert "egfr_stage" not in result.derived_facts
    assert "uacr_stage" not in result.derived_facts
    assert "kdigo_risk_category" not in result.derived_facts

    # Unknown facts are tracked
    assert "egfr" in result.unknown_facts
    assert "uacr" in result.unknown_facts

    # Etiology rule for diabetes should still fire
    assert result.derived_facts.get("diabetic_nephropathy_risk") == "Elevated_Diabetic_Etiology"
