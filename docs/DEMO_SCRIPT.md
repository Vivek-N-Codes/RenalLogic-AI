# RenalLogic AI: Competition Presentation & Demonstration Script

> **Target Audience**: AI Subject Professor, Competition Evaluation Committee, and Technical Judges.  
> **Estimated Duration**: 4 to 6 minutes.  
> **Project Theme**: Classical Symbolic AI, Declarative Knowledge Bases, Forward & Backward Chaining, 3-Valued Kleene Logic, and Explainable Clinical Decision Support.

---

## Act 1: The Problem & The Classical AI Hook (0:00 – 0:45)

**Spoken Script:**
> *"Good morning, Professor and respected judges. Today, I am proud to present **RenalLogic AI**: An Explainable Rule-Based Expert System for Chronic Kidney Disease (CKD) Risk Assessment using Forward and Backward Chaining.*
>
> *In high-stakes medicine, modern deep neural networks often fail because they are black boxes: they hallucinate confidence scores and cannot trace their reasoning step-by-step back to authoritative clinical guidelines.*
>
> *RenalLogic AI addresses this by demonstrating real classical Artificial Intelligence: a declarative knowledge base verified against official **KDIGO 2024 guidelines**, a decoupled **Working Memory** architecture, **Kleene 3-valued logic** for missing facts, and transparent **Forward and Backward Chaining engines** with an interactive reasoning proof graph."*

---

## Act 2: Demonstration 1 – Forward Chaining Data-Driven Synthesis (0:45 – 1:45)

**Action in UI:**
1. Navigate to the **Clinical Assessment** tab.
2. In the **Test Laboratory** dropdown, select **CASE_1: Confirmed Chronic Impairment (KDIGO High Risk)**.
3. Observe inputs: eGFR = 42 mL/min/1.73m², UACR = 120 mg/g, Chronicity $\ge$ 3 Months = Yes, Diabetes = Yes, Hypertension = Yes.
4. Click **"Run Forward Chaining"**.

**Spoken Script:**
> *"Here, we see data-driven forward chaining in action. The clinical observations initialize Working Memory. Our engine runs a classic Match-Resolve-Act cycle:*
> 1. *It fires rule `R_GFR_G3B`, classifying eGFR 42 as stage G3b.*
> 2. *It fires rule `R_ACR_A2`, classifying UACR 120 as stage A2.*
> 3. *It evaluates persistence: because the abnormality has persisted for at least 3 months, rule `R_CHRON_CONFIRMED` fires.*
> 4. *Our agenda conflict resolution orders rules by priority tier: staging rules fire first, followed by marker detection, chronicity, and finally the KDIGO composite risk grid rule `R_RISK_G3B_A2`, which deterministically assigns the patient to the **Very High Risk (Red Zone)**.*
>
> *Notice that every step is fully auditable. We can switch to the **Inference Trace** tab to inspect the exact mathematical comparison for each antecedent condition."*

---

## Act 3: Demonstration 2 – The KDIGO 3-Month Chronicity Safety Rule (1:45 – 2:45)

**Action in UI:**
1. Switch to the **Test Laboratory** tab.
2. Click **"Run Forward"** on **CASE_2: Reduced eGFR with Unknown Chronicity**.
3. Point out the headline banner on the dashboard.

**Spoken Script:**
> *"One of the most critical contributions of RenalLogic AI is our adherence to real medical guidelines rather than naive thresholds. Under KDIGO 2024 guidelines, chronic kidney disease requires abnormalities to persist for **more than three months**.*
>
> *In CASE_2, the patient has an abnormal eGFR of 38, but prior history is unknown. A naive system would immediately diagnose CKD. But our rule base fires `R_CHRON_UNKNOWN_PERSISTENCE` and `R_ASSESS_UNCONFIRMED_CHRONICITY`.*
>
> *The system flags that this single abnormal value could be Acute Kidney Injury (AKI) or transient dehydration, explicitly directing that repeat laboratory testing in 3 months is mandatory before confirming a diagnosis. This demonstrates genuine AI safety in clinical medicine."*

---

## Act 4: Demonstration 3 – Backward Chaining & Kleene 3-Valued Logic (2:45 – 4:00)

**Action in UI:**
1. In the **Inference Architecture Mode** selector, click **Backward Chaining**.
2. Select target hypothesis: `assessment_summary = Confirmed_CKD_Criteria_Met`.
3. In the input form, click **"Clear to Unknown"** on eGFR so eGFR is missing.
4. Click **"Prove Hypothesis (Backward)"**.
5. Show the **UNDETERMINED** banner and missing premises diagnostics.

**Spoken Script:**
> *"Now let's examine our goal-driven **Backward Chaining** engine. Unlike systems that merely wrap forward chaining, our backward reasoner takes a target clinical hypothesis and recursively queries the knowledge base:*
> - *It finds rules that conclude the target.*
> - *It recursively breaks them into subgoals and inspects working memory.*
> - *It maintains an active goal stack to prevent circular infinite loops.*
>
> *Look at the result: the hypothesis evaluates to **UNDETERMINED**. Why? Because eGFR is unknown!*
>
> *Under classical **Kleene 3-Valued Logic**, missing facts are explicitly recognized as uncertainty and are **never** assumed to be false. The engine lists the exact missing premises required to complete the proof tree."*

---

## Act 5: Demonstration 4 – Interactive Reasoning Graph & Printable Audit (4:00 – 5:00)

**Action in UI:**
1. Click the **Reasoning Graph** tab.
2. Show the React Flow graph. Pan and zoom slightly.
3. Click on a rule node (e.g., `rule_R_GFR_G3B`) to open the **Node Inspector Drawer**.
4. In the top navbar, click **"Print Report"**.
5. Show the clean clinical summary modal with local Case ID and disclaimer.

**Spoken Script:**
> *"To make this system intuitive for doctors and researchers, we generate dynamic graphs using `@xyflow/react` directly from our backend inference engine.*
>
> *We can see the entire causal dependency graph: User Facts on the left $\rightarrow$ Rule nodes in the center $\rightarrow$ Derived classifications on the right. Clicking any node opens the Node Inspector showing preconditions and citations.*
>
> *Finally, clicking **'Print Report'** generates a formal clinical summary with a unique case identifier, fired rules, and educational safety disclaimers, adhering to ethical AI principles.*
>
> *In conclusion, RenalLogic AI demonstrates that classical symbolic AI provides the determinism, explainability, and safety required for modern healthcare systems. Thank you, and I look forward to your questions!"*

---

## Professor Defense Q&A Cheatsheet

### Q1: "Why use rule-based reasoning instead of training a machine learning model?"
> **Answer**: *"Machine learning models require massive labeled datasets, can suffer from distribution drift, and their reasoning is opaque ('black-box'). In healthcare, clinical guidelines like KDIGO 2024 are already formalized by world consensus. A rule-based expert system allows 100% deterministic traceability, zero hallucination, and the ability to explain every deduction back to a specific guideline chapter."*

### Q2: "How does your forward chaining engine prevent infinite loops?"
> **Answer**: *"Our forward chainer implements two guards: first, each rule can fire at most once during a session; second, if a rule's consequent is already asserted in Working Memory with an identical value, the rule is retired from the agenda. Additionally, a hard step bound prevents runaway execution."*

### Q3: "How does your backward chaining handle circular rules ($A \to B \to A$)?"
> **Answer**: *"Our backward chainer maintains an active `goal_stack`. Before expanding any subgoal, it checks whether that `(fact, value)` tuple is already in the stack. If detected, it immediately halts recursion on that branch and returns `UNDETERMINED`, preventing stack overflow."*

### Q4: "What is your approach to handling missing patient information?"
> **Answer**: *"We implement Kleene 3-Valued Logic ($\mathbb{K}_3$) with truth states True, False, and Unknown. Missing values are never silently defaulted to false or zero. A rule fires only when its premise is strictly True. If an antecedent condition relies on an unknown fact, the premise evaluates to Unknown, preventing false inferences while explicitly tracking what tests the clinician still needs to order."*
