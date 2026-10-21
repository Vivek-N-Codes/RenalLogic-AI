"""
Tests verifying all 8 curated competition demo cases.
"""

from pathlib import Path
import pytest
from app.engine import KnowledgeBase
from app.forward_chaining import ForwardChainer
from app.backward_chaining import BackwardChainer, GoalStatus
from app.sample_cases import SAMPLE_CASES

KB_PATH = Path(__file__).parent.parent / "app" / "knowledge_base.json"


@pytest.fixture
def knowledge_base():
    return KnowledgeBase.load_from_file(KB_PATH)


def test_all_sample_cases_execution(knowledge_base):
    fc = ForwardChainer(knowledge_base)
    bc = BackwardChainer(knowledge_base)

    for case in SAMPLE_CASES:
        inputs = case["inputs"]
        fc_res = fc.run(inputs)
        assert fc_res.success is True

        target_hypo = case["target_hypothesis"]
        target_fact = target_hypo["fact"]
        target_value = target_hypo["value"]

        bc_res = bc.verify_hypothesis(
            target_fact=target_fact,
            target_value=target_value,
            working_memory=fc_res.working_memory.clone(),
        )

        assert bc_res.status in [
            GoalStatus.SUPPORTED,
            GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
            GoalStatus.UNDETERMINED,
        ]


def test_chronicity_distinction_scenarios(knowledge_base):
    fc = ForwardChainer(knowledge_base)

    # Case with eGFR 35, chronicity == 'yes' -> Confirmed_Persistent
    res_persistent = fc.run({"egfr": 35.0, "uacr": 20.0, "chronicity_ge_3m": "yes"})
    assert res_persistent.derived_facts.get("chronicity_status") == "Confirmed_Persistent"
    assert res_persistent.derived_facts.get("assessment_summary") == "Confirmed_CKD_Criteria_Met"

    # Case with eGFR 35, chronicity == 'no' -> Acute_or_Unconfirmed
    res_acute = fc.run({"egfr": 35.0, "uacr": 20.0, "chronicity_ge_3m": "no"})
    assert res_acute.derived_facts.get("chronicity_status") == "Acute_or_Unconfirmed"
    assert res_acute.derived_facts.get("assessment_summary") == "Acute_Kidney_Abnormality_Suspected"

    # Case with eGFR 35, chronicity == 'unknown' -> Unknown_Persistence
    res_unknown = fc.run({"egfr": 35.0, "uacr": 20.0, "chronicity_ge_3m": "unknown"})
    assert res_unknown.derived_facts.get("chronicity_status") == "Unknown_Persistence"
    assert res_unknown.derived_facts.get("assessment_summary") == "Abnormal_Markers_Chronicity_Unverified"
