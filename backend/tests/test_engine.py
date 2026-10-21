"""
Tests for Core Engine, Working Memory, and 3-Valued Kleene Logic.
"""

import pytest
from app.engine import Condition, Rule, WorkingMemory, TriState, KnowledgeBase


def test_working_memory_user_facts():
    wm = WorkingMemory()
    wm.set_user_fact("egfr", 45.0)
    wm.set_user_fact("diabetes", "yes")

    is_known, val = wm.get("egfr")
    assert is_known is True
    assert val == 45.0
    assert wm.fact_sources["egfr"] == "user"


def test_working_memory_derived_facts():
    wm = WorkingMemory()
    wm.set_derived_fact("egfr_stage", "G3a", rule_id="R_GFR_G3A")

    is_known, val = wm.get("egfr_stage")
    assert is_known is True
    assert val == "G3a"
    assert wm.fact_sources["egfr_stage"] == "rule:R_GFR_G3A"


def test_working_memory_explicit_unknowns():
    wm = WorkingMemory()
    wm.set_user_fact("egfr", None)
    wm.set_user_fact("uacr", "unknown")

    is_known_egfr, val_egfr = wm.get("egfr")
    assert is_known_egfr is False
    assert val_egfr is None
    assert "egfr" in wm.unknown_facts
    assert "uacr" in wm.unknown_facts


def test_condition_three_valued_logic():
    wm = WorkingMemory()
    wm.set_user_fact("egfr", 50.0)

    # Known true
    cond1 = Condition(fact="egfr", operator=">=", value=45)
    assert cond1.evaluate(wm) is True

    # Known false
    cond2 = Condition(fact="egfr", operator="<", value=30)
    assert cond2.evaluate(wm) is False

    # UNKNOWN fact: MUST return None (TriState.UNKNOWN), NOT False!
    cond3 = Condition(fact="uacr", operator=">=", value=30)
    assert cond3.evaluate(wm) is TriState.UNKNOWN

    # is_unknown operator on unknown fact
    cond_unk = Condition(fact="uacr", operator="is_unknown")
    assert cond_unk.evaluate(wm) is True

    # is_known operator on unknown fact
    cond_known = Condition(fact="uacr", operator="is_known")
    assert cond_known.evaluate(wm) is False


def test_condition_in_operator():
    wm = WorkingMemory()
    wm.set_user_fact("stage", "G3b")

    cond_in = Condition(fact="stage", operator="in", value=["G3a", "G3b", "G4"])
    assert cond_in.evaluate(wm) is True

    cond_not_in = Condition(fact="stage", operator="in", value=["G1", "G2"])
    assert cond_not_in.evaluate(wm) is False
