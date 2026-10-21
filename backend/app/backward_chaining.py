"""
RenalLogic AI - Backward Chaining Inference Engine
Goal-Driven Recursive Hypothesis Verification with Explicit Three-Valued Status,
Cycle Detection, Proof Tree Construction, and Missing Fact Diagnostics.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

from .engine import KnowledgeBase, Rule, WorkingMemory, Condition


class GoalStatus(str, Enum):
    """Explicit three-valued goal evaluation states."""
    SUPPORTED = "SUPPORTED"
    NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE = "NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE"
    UNDETERMINED = "UNDETERMINED"


@dataclass
class ProofNode:
    """Node in the recursive proof tree."""
    fact: str
    target_value: Any
    status: GoalStatus
    reason: str
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    children: List["ProofNode"] = field(default_factory=list)
    unresolved_premises: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fact": self.fact,
            "target_value": self.target_value,
            "status": self.status.value,
            "reason": self.reason,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "unresolved_premises": self.unresolved_premises,
            "children": [c.to_dict() for c in self.children],
        }


@dataclass
class BackwardChainingResult:
    """Complete result of backward chaining hypothesis verification."""
    target_fact: str
    target_value: Any
    status: GoalStatus
    explanation: str
    proof_tree: ProofNode
    rules_examined: List[str]
    supporting_rules: List[str]
    missing_facts: List[str]
    graph_data: Dict[str, Any]


class BackwardChainer:
    """
    Classical goal-driven backward chaining engine.
    Proves or disproves a target hypothesis recursively.
    """

    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base

    def verify_hypothesis(
        self,
        target_fact: str,
        target_value: Any,
        working_memory: WorkingMemory,
    ) -> BackwardChainingResult:
        """
        Verify whether the goal (target_fact == target_value) is SUPPORTED,
        NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE, or UNDETERMINED.
        """
        rules_examined: Set[str] = set()
        supporting_rules: List[str] = []
        missing_facts: Set[str] = set()
        goal_stack: List[str] = []

        proof_tree = self._evaluate_goal(
            fact=target_fact,
            target_value=target_value,
            wm=working_memory,
            goal_stack=goal_stack,
            rules_examined=rules_examined,
            supporting_rules=supporting_rules,
            missing_facts=missing_facts,
        )

        # Build user-friendly summary explanation
        if proof_tree.status == GoalStatus.SUPPORTED:
            summary = (
                f"Hypothesis [{target_fact} = {target_value}] is fully SUPPORTED by available evidence "
                f"via rule: {proof_tree.rule_name or 'Direct Evidence'}."
            )
        elif proof_tree.status == GoalStatus.UNDETERMINED:
            missing_str = ", ".join(sorted(list(missing_facts))) or "unresolved intermediate rules"
            summary = (
                f"Hypothesis [{target_fact} = {target_value}] is UNDETERMINED. "
                f"Missing or unasserted information: [{missing_str}]. "
                "Per classical AI safety rules, missing facts are never assumed to be false."
            )
        else:
            summary = (
                f"Hypothesis [{target_fact} = {target_value}] is NOT SUPPORTED by available evidence. "
                f"Reason: {proof_tree.reason}."
            )

        graph_data = self._generate_graph(proof_tree, target_fact, target_value)

        return BackwardChainingResult(
            target_fact=target_fact,
            target_value=target_value,
            status=proof_tree.status,
            explanation=summary,
            proof_tree=proof_tree,
            rules_examined=sorted(list(rules_examined)),
            supporting_rules=supporting_rules,
            missing_facts=sorted(list(missing_facts)),
            graph_data=graph_data,
        )

    def _evaluate_goal(
        self,
        fact: str,
        target_value: Any,
        wm: WorkingMemory,
        goal_stack: List[str],
        rules_examined: Set[str],
        supporting_rules: List[str],
        missing_facts: Set[str],
    ) -> ProofNode:
        goal_key = f"{fact}:{target_value}"

        # 1. Cycle detection
        if goal_key in goal_stack:
            return ProofNode(
                fact=fact,
                target_value=target_value,
                status=GoalStatus.UNDETERMINED,
                reason=f"Circular dependency detected in proof path: {goal_key}",
            )

        # 2. Check working memory (base case)
        is_known, actual_value = wm.get(fact)
        if is_known:
            if self._matches(actual_value, target_value):
                return ProofNode(
                    fact=fact,
                    target_value=target_value,
                    status=GoalStatus.SUPPORTED,
                    reason=f"Directly verified in working memory: {fact} = {actual_value}",
                )
            else:
                return ProofNode(
                    fact=fact,
                    target_value=target_value,
                    status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                    reason=f"Contradicted by working memory: actual {fact} = {actual_value}, expected {target_value}",
                )

        # 3. If fact is explicitly unknown in working memory
        if fact in wm.unknown_facts:
            # We will still check if rules can derive it, but if no rules exist, it is a primitive unknown
            pass

        # 4. Search rules deriving this fact
        candidate_rules = self.kb.get_rules_for_conclusion(fact, target_value)
        if not candidate_rules:
            # No rules can derive this fact, and it is not in working memory -> primitive missing fact
            missing_facts.add(fact)
            return ProofNode(
                fact=fact,
                target_value=target_value,
                status=GoalStatus.UNDETERMINED,
                reason=f"Primitive fact '{fact}' is unknown and no rules can establish it.",
            )

        goal_stack.append(goal_key)

        has_undetermined_rule = False
        all_rules_contradicted = True
        best_undetermined_node: Optional[ProofNode] = None

        for rule in candidate_rules:
            rules_examined.add(rule.id)
            rule_conditions_supported = True
            rule_undetermined = False
            rule_contradicted = False
            children_nodes: List[ProofNode] = []
            unresolved: List[Dict[str, Any]] = []

            for cond in rule.conditions:
                cond_fact = cond.fact
                cond_op = cond.operator
                cond_val = cond.value

                # Evaluate condition against working memory
                cond_known, cond_actual = wm.get(cond_fact)

                if cond_known:
                    cond_eval = cond.evaluate(wm)
                    if cond_eval is True:
                        child = ProofNode(
                            fact=cond_fact,
                            target_value=f"{cond_op} {cond_val}",
                            status=GoalStatus.SUPPORTED,
                            reason=f"Satisfied by working memory ({cond_fact} = {cond_actual})",
                        )
                        children_nodes.append(child)
                    else:
                        rule_contradicted = True
                        rule_conditions_supported = False
                        child = ProofNode(
                            fact=cond_fact,
                            target_value=f"{cond_op} {cond_val}",
                            status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                            reason=f"Contradicted ({cond_fact} = {cond_actual} does not satisfy {cond_op} {cond_val})",
                        )
                        children_nodes.append(child)
                        break
                else:
                    # Fact is unknown in WM: try to recursively prove it as a subgoal
                    # If operator is comparison (<, >, ==, in), find candidate target value
                    subgoal_target = cond_val if cond_op == "==" else cond_val
                    subgoal_res = self._evaluate_subgoal_condition(
                        cond=cond,
                        wm=wm,
                        goal_stack=goal_stack,
                        rules_examined=rules_examined,
                        supporting_rules=supporting_rules,
                        missing_facts=missing_facts,
                    )
                    children_nodes.append(subgoal_res)

                    if subgoal_res.status == GoalStatus.SUPPORTED:
                        # Condition proven
                        pass
                    elif subgoal_res.status == GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE:
                        rule_contradicted = True
                        rule_conditions_supported = False
                        break
                    else:  # UNDETERMINED
                        rule_undetermined = True
                        rule_conditions_supported = False
                        unresolved.append({
                            "fact": cond_fact,
                            "condition": f"{cond_op} {cond_val}",
                            "reason": subgoal_res.reason,
                        })

            if rule_conditions_supported and not rule_contradicted and not rule_undetermined:
                # Rule completely proved!
                goal_stack.pop()
                if rule.id not in supporting_rules:
                    supporting_rules.append(rule.id)

                return ProofNode(
                    fact=fact,
                    target_value=target_value,
                    status=GoalStatus.SUPPORTED,
                    reason=f"Proven via rule {rule.id} ({rule.name})",
                    rule_id=rule.id,
                    rule_name=rule.name,
                    children=children_nodes,
                )

            if rule_undetermined and not rule_contradicted:
                has_undetermined_rule = True
                all_rules_contradicted = False
                best_undetermined_node = ProofNode(
                    fact=fact,
                    target_value=target_value,
                    status=GoalStatus.UNDETERMINED,
                    reason=f"Rule {rule.id} cannot be satisfied due to unresolved conditions.",
                    rule_id=rule.id,
                    rule_name=rule.name,
                    children=children_nodes,
                    unresolved_premises=unresolved,
                )
            elif not rule_contradicted:
                all_rules_contradicted = False

        goal_stack.pop()

        if has_undetermined_rule and best_undetermined_node:
            return best_undetermined_node

        if all_rules_contradicted:
            return ProofNode(
                fact=fact,
                target_value=target_value,
                status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                reason="All candidate rules deriving this goal are contradicted by available facts.",
            )

        return ProofNode(
            fact=fact,
            target_value=target_value,
            status=GoalStatus.UNDETERMINED,
            reason="Goal cannot be definitively proved or disproved with current evidence.",
        )

    def _evaluate_subgoal_condition(
        self,
        cond: Condition,
        wm: WorkingMemory,
        goal_stack: List[str],
        rules_examined: Set[str],
        supporting_rules: List[str],
        missing_facts: Set[str],
    ) -> ProofNode:
        """
        Recursively evaluate whether an antecedent condition can be satisfied.
        Handles ==, in, and range operators.
        """
        fact = cond.fact
        op = cond.operator
        val = cond.value

        if op == "is_unknown":
            is_known, actual_val = wm.get(fact)
            if not is_known or fact in wm.unknown_facts:
                return ProofNode(
                    fact=fact,
                    target_value="is_unknown",
                    status=GoalStatus.SUPPORTED,
                    reason=f"Fact '{fact}' is unknown/unasserted in working memory",
                )
            return ProofNode(
                fact=fact,
                target_value="is_unknown",
                status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                reason=f"Fact '{fact}' is known with value '{actual_val}'",
            )

        if op == "==" and str(val).lower() == "unknown":
            is_known, actual_val = wm.get(fact)
            if not is_known or fact in wm.unknown_facts:
                return ProofNode(
                    fact=fact,
                    target_value="unknown",
                    status=GoalStatus.SUPPORTED,
                    reason=f"Fact '{fact}' is confirmed unknown in working memory",
                )
            return ProofNode(
                fact=fact,
                target_value="unknown",
                status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                reason=f"Fact '{fact}' is known with value '{actual_val}'",
            )

        if op == "==":
            return self._evaluate_goal(
                fact=fact,
                target_value=val,
                wm=wm,
                goal_stack=goal_stack,
                rules_examined=rules_examined,
                supporting_rules=supporting_rules,
                missing_facts=missing_facts,
            )
        elif op == "in" and isinstance(val, (list, tuple, set)):
            # Disjunction: any value in list is sufficient
            undetermined_node = None
            for option in val:
                node = self._evaluate_goal(
                    fact=fact,
                    target_value=option,
                    wm=wm,
                    goal_stack=goal_stack,
                    rules_examined=rules_examined,
                    supporting_rules=supporting_rules,
                    missing_facts=missing_facts,
                )
                if node.status == GoalStatus.SUPPORTED:
                    return node
                if node.status == GoalStatus.UNDETERMINED and not undetermined_node:
                    undetermined_node = node
            if undetermined_node:
                return undetermined_node
            return ProofNode(
                fact=fact,
                target_value=val,
                status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                reason=f"None of the acceptable values {val} could be established for {fact}",
            )
        else:
            # Primitive condition or complex range
            is_known, actual = wm.get(fact)
            if not is_known:
                missing_facts.add(fact)
                return ProofNode(
                    fact=fact,
                    target_value=f"{op} {val}",
                    status=GoalStatus.UNDETERMINED,
                    reason=f"Required input '{fact}' is unknown",
                )
            eval_res = cond.evaluate(wm)
            if eval_res is True:
                return ProofNode(
                    fact=fact,
                    target_value=f"{op} {val}",
                    status=GoalStatus.SUPPORTED,
                    reason=f"Fact {fact} = {actual} satisfies {op} {val}",
                )
            return ProofNode(
                fact=fact,
                target_value=f"{op} {val}",
                status=GoalStatus.NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE,
                reason=f"Fact {fact} = {actual} fails condition {op} {val}",
            )

    def _matches(self, actual: Any, target: Any) -> bool:
        if actual == target:
            return True
        try:
            return float(actual) == float(target)
        except (ValueError, TypeError):
            return str(actual).lower() == str(target).lower()

    def _generate_graph(
        self,
        root: ProofNode,
        target_fact: str,
        target_value: Any,
    ) -> Dict[str, Any]:
        """Convert proof tree into React Flow nodes and edges."""
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []
        visited_nodes: Set[str] = set()

        def status_color(status: GoalStatus) -> str:
            if status == GoalStatus.SUPPORTED:
                return "#059669"  # Green
            if status == GoalStatus.UNDETERMINED:
                return "#d97706"  # Amber
            return "#dc2626"  # Red

        def traverse(node: ProofNode, x: float, y: float, parent_id: Optional[str] = None):
            node_id = f"node_{node.fact}_{id(node)}"
            if node_id in visited_nodes:
                return
            visited_nodes.add(node_id)

            nodes.append({
                "id": node_id,
                "type": "proofNode",
                "position": {"x": x, "y": y},
                "data": {
                    "label": f"{node.fact}: {node.target_value}",
                    "fact": node.fact,
                    "targetValue": node.target_value,
                    "status": node.status.value,
                    "reason": node.reason,
                    "ruleId": node.rule_id,
                    "ruleName": node.rule_name,
                    "unresolved": node.unresolved_premises,
                },
            })

            if parent_id:
                edges.append({
                    "id": f"edge_{node_id}_to_{parent_id}",
                    "source": node_id,
                    "target": parent_id,
                    "label": node.status.value,
                    "animated": (node.status == GoalStatus.SUPPORTED),
                    "style": {
                        "stroke": status_color(node.status),
                        "strokeWidth": 2,
                        "strokeDasharray": "5,5" if node.status == GoalStatus.UNDETERMINED else None,
                    },
                })

            if node.children:
                child_count = len(node.children)
                spread = max(180, (child_count - 1) * 90)
                start_x = x - spread / 2
                for i, child in enumerate(node.children):
                    child_x = start_x + (i * (spread / max(1, child_count - 1))) if child_count > 1 else x
                    child_y = y + 130
                    traverse(child, child_x, child_y, parent_id=node_id)

        # Place root (target hypothesis) at top center
        traverse(root, 450, 40)
        return {"nodes": nodes, "edges": edges}
