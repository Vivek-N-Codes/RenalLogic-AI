"""
RenalLogic AI - Core Inference Engine Foundations
Classical Rule-Based Expert System: Knowledge Representation, Working Memory,
Three-Valued Logic Evaluation, and Trace Models.
"""

from __future__ import annotations
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union


class TriState:
    """Three-valued Kleene logic values for reasoning under uncertainty."""
    TRUE = True
    FALSE = False
    UNKNOWN = None


@dataclass
class Condition:
    """
    Premise antecedent condition for a rule.
    Supports operators: ==, !=, <, <=, >, >=, in, is_known, is_unknown.
    """
    fact: str
    operator: str
    value: Any = None

    def evaluate(self, working_memory: "WorkingMemory") -> Optional[bool]:
        """
        Evaluate condition against working memory using 3-valued logic:
        Returns True, False, or None (Unknown).
        """
        is_known, actual_value = working_memory.get(self.fact)

        if self.operator == "is_unknown":
            return not is_known or (self.fact in working_memory.unknown_facts)
        if self.operator == "is_known":
            return is_known and (self.fact not in working_memory.unknown_facts)

        if self.operator == "==" and str(self.value).lower() == "unknown":
            return (not is_known) or (self.fact in working_memory.unknown_facts)

        if not is_known or actual_value is None:
            # Fact is unknown/unasserted: cannot prove or disprove comparison
            return TriState.UNKNOWN

        try:
            op = self.operator
            expected = self.value

            if op == "==":
                return actual_value == expected
            elif op == "!=":
                return actual_value != expected
            elif op == "<":
                return float(actual_value) < float(expected)
            elif op == "<=":
                return float(actual_value) <= float(expected)
            elif op == ">":
                return float(actual_value) > float(expected)
            elif op == ">=":
                return float(actual_value) >= float(expected)
            elif op == "in":
                if isinstance(expected, (list, tuple, set)):
                    return actual_value in expected
                return False
            else:
                # Unsupported operator treated as False
                return False
        except (ValueError, TypeError):
            # Type error or invalid comparison
            return False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fact": self.fact,
            "operator": self.operator,
            "value": self.value,
        }


@dataclass
class Rule:
    """Declarative production rule."""
    id: str
    name: str
    category: str
    priority: int
    conditions: List[Condition]
    conclusion: Dict[str, Any]  # {"fact": str, "value": Any}
    explanation: str
    source: str
    review_status: str = "verified"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Rule":
        conditions = [
            Condition(
                fact=c["fact"],
                operator=c["operator"],
                value=c.get("value"),
            )
            for c in data.get("conditions", [])
        ]
        return cls(
            id=data["id"],
            name=data["name"],
            category=data.get("category", "General"),
            priority=data.get("priority", 50),
            conditions=conditions,
            conclusion=data["conclusion"],
            explanation=data["explanation"],
            source=data.get("source", "KDIGO 2024"),
            review_status=data.get("review_status", "verified"),
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "priority": self.priority,
            "conditions": [c.to_dict() for c in self.conditions],
            "conclusion": self.conclusion,
            "explanation": self.explanation,
            "source": self.source,
            "review_status": self.review_status,
        }


@dataclass
class InferenceTraceEntry:
    """Record of a fired rule during inference."""
    step: int
    rule_id: str
    rule_name: str
    category: str
    matched_conditions: List[Dict[str, Any]]
    conclusion: Dict[str, Any]
    explanation: str
    source: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "category": self.category,
            "matched_conditions": self.matched_conditions,
            "conclusion": self.conclusion,
            "explanation": self.explanation,
            "source": self.source,
        }


class WorkingMemory:
    """
    Working Memory maintains assertions, distinguishes user-supplied facts,
    derived facts, unknown facts, and provenance of each assertion.
    """

    def __init__(self):
        self.user_facts: Dict[str, Any] = {}
        self.derived_facts: Dict[str, Any] = {}
        self.unknown_facts: Set[str] = set()
        self.fact_sources: Dict[str, str] = {}  # fact_name -> "user" | rule_id

    def set_user_fact(self, name: str, value: Any) -> None:
        """Store a verified user-supplied fact."""
        if value is None or value == "" or str(value).lower() == "unknown":
            self.set_unknown_fact(name)
            return

        self.user_facts[name] = value
        self.unknown_facts.discard(name)
        self.fact_sources[name] = "user"

    def set_derived_fact(self, name: str, value: Any, rule_id: str) -> None:
        """Store a fact derived by an inference rule."""
        self.derived_facts[name] = value
        self.unknown_facts.discard(name)
        self.fact_sources[name] = f"rule:{rule_id}"

    def set_unknown_fact(self, name: str) -> None:
        """Explicitly record an unknown or unasserted fact."""
        self.user_facts.pop(name, None)
        self.derived_facts.pop(name, None)
        self.fact_sources.pop(name, None)
        self.unknown_facts.add(name)

    def get(self, name: str) -> Tuple[bool, Any]:
        """
        Retrieve a fact. Returns (is_known: bool, value: Any).
        Checks derived facts first (newer/specific), then user facts.
        """
        if name in self.derived_facts:
            return True, self.derived_facts[name]
        if name in self.user_facts:
            return True, self.user_facts[name]
        return False, None

    def is_known(self, name: str) -> bool:
        return name in self.derived_facts or name in self.user_facts

    def all_facts(self) -> Dict[str, Any]:
        """Return unified view of all known facts."""
        unified = dict(self.user_facts)
        unified.update(self.derived_facts)
        return unified

    def clone(self) -> "WorkingMemory":
        """Create a deep clone for speculative branch evaluation."""
        copy_wm = WorkingMemory()
        copy_wm.user_facts = dict(self.user_facts)
        copy_wm.derived_facts = dict(self.derived_facts)
        copy_wm.unknown_facts = set(self.unknown_facts)
        copy_wm.fact_sources = dict(self.fact_sources)
        return copy_wm


class KnowledgeBase:
    """Repository of clinical production rules."""

    def __init__(self, rules: List[Rule], metadata: Optional[Dict[str, Any]] = None):
        self.rules: List[Rule] = rules
        self.metadata: Dict[str, Any] = metadata or {}
        self.rules_by_id: Dict[str, Rule] = {r.id: r for r in rules}

    @classmethod
    def load_from_file(cls, filepath: Union[str, Path]) -> "KnowledgeBase":
        path = Path(filepath)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        rules = [Rule.from_dict(r) for r in data.get("rules", [])]
        metadata = data.get("metadata", {})
        return cls(rules, metadata)

    def get_rules_for_conclusion(self, fact_name: str, target_value: Any = None) -> List[Rule]:
        """Find candidate rules that derive target fact/value (for backward chaining)."""
        candidates = []
        for rule in self.rules:
            conc = rule.conclusion
            if conc.get("fact") == fact_name:
                if target_value is None or conc.get("value") == target_value:
                    candidates.append(rule)
        return candidates
