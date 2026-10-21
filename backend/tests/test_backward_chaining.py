"""
Tests for Backward Chaining Goal-Driven Hypothesis Engine.
"""

from pathlib import Path
import pytest
from app.engine import KnowledgeBase, WorkingMemory
from app.backward_chaining import BackwardChainer, GoalStatus

KB_PATH = Path(__file__).parent.parent / "app" / "knowledge_base.json"


@pytest.fixture
def knowledge_base():
    return KnowledgeBase.load_from_file(KB_PATH)


def test_backward_chaining_supported_hypothesis(knowledge_base):
    chainer = BackwardChainer(knowledge_base)
    wm = WorkingMemory()
    wm.set_user_fact("egfr", 25.0)  # G4
    wm.set_user_fact("uacr", 15.0)  # A1

    # Hypothesis: Is KDIGO risk "Very_High"?
    result = chainer.verify_hypothesis(
        target_fact="kdigo_risk_category",
        target_value="Very_High",
        working_memory=wm,
    )

    assert result.status == GoalStatus.SUPPORTED
    assert "R_RISK_G4_ANY" in result.supporting_rules
    assert result.proof_tree.status == GoalStatus.SUPPORTED


def test_backward_chaining_contradicted_hypothesis(knowledge_base):
    chainer = BackwardChainer(knowledge_base)
    wm = WorkingMemory()
    wm.set_user_fact("egfr", 100.0)  # G1
    wm.set_user_fact("uacr", 10.0)   # A1

    # Hypothesis: Is KDIGO risk "Very_High"?
    result = chainer.verify_hypothesis(
        target_fact="kdigo_risk_category",
        target_value="Very_High",
        working_memory=wm,
    )

    assert result.status == GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE


def test_backward_chaining_undetermined_missing_facts(knowledge_base):
    chainer = BackwardChainer(knowledge_base)
    wm = WorkingMemory()
    # eGFR is NOT provided (unknown)
    wm.set_user_fact("uacr", 15.0)

    # Hypothesis: Is KDIGO risk "Very_High"?
    result = chainer.verify_hypothesis(
        target_fact="kdigo_risk_category",
        target_value="Very_High",
        working_memory=wm,
    )

    # Must be UNDETERMINED, because eGFR is unknown, not assumed false!
    assert result.status == GoalStatus.UNDETERMINED
    assert "egfr" in result.missing_facts
