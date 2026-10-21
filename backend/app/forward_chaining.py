"""
RenalLogic AI - Forward Chaining Inference Engine
Data-Driven Deduction with Conflict Resolution, Cycle Prevention,
Trace Logging, and Graph Representation Generation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Set, Optional

from .engine import KnowledgeBase, Rule, WorkingMemory, InferenceTraceEntry, TriState


@dataclass
class ForwardChainingResult:
    """Output summary of forward chaining execution."""
    success: bool
    working_memory: WorkingMemory
    trace: List[InferenceTraceEntry]
    fired_rule_ids: List[str]
    supplied_facts: Dict[str, Any]
    derived_facts: Dict[str, Any]
    unknown_facts: List[str]
    graph_data: Dict[str, Any]  # React Flow nodes & edges
    cycles_detected: int = 0
    max_steps_reached: bool = False


class ForwardChainer:
    """
    Classical forward-chaining deduction engine.
    Applies Match-Resolve-Act cycle until working memory reaches quiescence.
    """

    def __init__(self, knowledge_base: KnowledgeBase, max_iterations: int = 50):
        self.kb = knowledge_base
        self.max_iterations = max_iterations

    def run(self, initial_facts: Dict[str, Any]) -> ForwardChainingResult:
        """
        Execute forward chaining given initial facts.
        Initial facts with None/empty/unknown are registered as unknown.
        """
        wm = WorkingMemory()
        for k, v in initial_facts.items():
            wm.set_user_fact(k, v)

        trace: List[InferenceTraceEntry] = []
        fired_rules: Set[str] = set()
        step = 1

        for iteration in range(self.max_iterations):
            # 1. MATCH: Find all rules whose premises are completely satisfied
            eligible_rules: List[Rule] = []

            for rule in self.kb.rules:
                if rule.id in fired_rules:
                    continue

                # Check if premise is fully satisfied
                premises_satisfied = True
                matched_details = []

                for cond in rule.conditions:
                    res = cond.evaluate(wm)
                    is_known, actual_val = wm.get(cond.fact)
                    matched_details.append({
                        "fact": cond.fact,
                        "operator": cond.operator,
                        "required_value": cond.value,
                        "actual_value": actual_val,
                        "satisfied": (res is True),
                    })

                    if res is not True:
                        premises_satisfied = False
                        break

                if premises_satisfied:
                    # Also check if fact is already asserted with identical value to avoid redundant firing
                    conc_fact = rule.conclusion["fact"]
                    conc_val = rule.conclusion["value"]
                    already_known, existing_val = wm.get(conc_fact)
                    if already_known and existing_val == conc_val:
                        # Mark as fired to avoid re-evaluating
                        fired_rules.add(rule.id)
                        continue

                    eligible_rules.append(rule)

            # If no rules can fire, system has reached quiescence
            if not eligible_rules:
                break

            # 2. CONFLICT RESOLUTION:
            # Sort by priority (ascending: lower number = higher precedence), then rule ID
            eligible_rules.sort(key=lambda r: (r.priority, r.id))
            rule_to_fire = eligible_rules[0]

            # 3. ACT: Fire the chosen rule
            conc_fact = rule_to_fire.conclusion["fact"]
            conc_val = rule_to_fire.conclusion["value"]
            wm.set_derived_fact(conc_fact, conc_val, rule_to_fire.id)
            fired_rules.add(rule_to_fire.id)

            # Re-evaluate matched details for the chosen rule to record in trace
            final_matched = []
            for cond in rule_to_fire.conditions:
                _, actual_val = wm.get(cond.fact)
                final_matched.append({
                    "fact": cond.fact,
                    "operator": cond.operator,
                    "required_value": cond.value,
                    "actual_value": actual_val,
                })

            trace_entry = InferenceTraceEntry(
                step=step,
                rule_id=rule_to_fire.id,
                rule_name=rule_to_fire.name,
                category=rule_to_fire.category,
                matched_conditions=final_matched,
                conclusion=rule_to_fire.conclusion,
                explanation=rule_to_fire.explanation,
                source=rule_to_fire.source,
            )
            trace.append(trace_entry)
            step += 1

        graph_data = self._generate_graph(wm, trace, fired_rules)

        return ForwardChainingResult(
            success=True,
            working_memory=wm,
            trace=trace,
            fired_rule_ids=list(fired_rules),
            supplied_facts=wm.user_facts,
            derived_facts=wm.derived_facts,
            unknown_facts=sorted(list(wm.unknown_facts)),
            graph_data=graph_data,
            max_steps_reached=(step > self.max_iterations),
        )

    def _generate_graph(
        self,
        wm: WorkingMemory,
        trace: List[InferenceTraceEntry],
        fired_rules: Set[str],
    ) -> Dict[str, Any]:
        """
        Generate React Flow compatible node and edge structures
        tracing: User Facts -> Rules -> Derived Conclusions.
        """
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        # 1. User Fact Nodes
        y_user = 50
        for fact_name, fact_val in wm.user_facts.items():
            node_id = f"fact_{fact_name}"
            nodes.append({
                "id": node_id,
                "type": "factNode",
                "position": {"x": 50, "y": y_user},
                "data": {
                    "label": f"{fact_name}: {fact_val}",
                    "fact": fact_name,
                    "value": fact_val,
                    "kind": "user_fact",
                    "status": "known",
                },
            })
            y_user += 90

        # Add Unknown Fact Nodes
        for fact_name in sorted(list(wm.unknown_facts)):
            node_id = f"fact_{fact_name}"
            nodes.append({
                "id": node_id,
                "type": "factNode",
                "position": {"x": 50, "y": y_user},
                "data": {
                    "label": f"{fact_name}: UNKNOWN",
                    "fact": fact_name,
                    "value": "UNKNOWN",
                    "kind": "unknown_fact",
                    "status": "unknown",
                },
            })
            y_user += 90

        # 2. Rule Nodes (from execution trace)
        y_rule = 50
        for entry in trace:
            rule_node_id = f"rule_{entry.rule_id}"
            nodes.append({
                "id": rule_node_id,
                "type": "ruleNode",
                "position": {"x": 380, "y": y_rule},
                "data": {
                    "label": entry.rule_name,
                    "ruleId": entry.rule_id,
                    "step": entry.step,
                    "category": entry.category,
                    "explanation": entry.explanation,
                    "source": entry.source,
                    "conclusion": entry.conclusion,
                    "status": "fired",
                },
            })

            # Edge from input conditions to rule node
            for cond in entry.matched_conditions:
                src_id = f"fact_{cond['fact']}"
                edges.append({
                    "id": f"edge_{src_id}_to_{rule_node_id}",
                    "source": src_id,
                    "target": rule_node_id,
                    "label": f"{cond['operator']} {cond['required_value']}",
                    "animated": True,
                    "style": {"stroke": "#0d9488", "strokeWidth": 2},
                })

            y_rule += 100

        # 3. Derived Fact Nodes
        y_derived = 50
        for entry in trace:
            conc = entry.conclusion
            fact_name = conc["fact"]
            fact_val = conc["value"]
            derived_node_id = f"fact_{fact_name}"

            # Only add if not already in nodes
            if not any(n["id"] == derived_node_id for n in nodes):
                nodes.append({
                    "id": derived_node_id,
                    "type": "derivedNode",
                    "position": {"x": 750, "y": y_derived},
                    "data": {
                        "label": f"{fact_name}: {fact_val}",
                        "fact": fact_name,
                        "value": fact_val,
                        "kind": "derived_fact",
                        "status": "derived",
                    },
                })
                y_derived += 95

            # Edge from Rule Node to Derived Fact Node
            rule_node_id = f"rule_{entry.rule_id}"
            edges.append({
                "id": f"edge_{rule_node_id}_to_{derived_node_id}",
                "source": rule_node_id,
                "target": derived_node_id,
                "label": "derives",
                "animated": True,
                "style": {"stroke": "#2563eb", "strokeWidth": 2},
            })

        return {"nodes": nodes, "edges": edges}
