# RenalLogic AI: An Explainable Rule-Based Expert System for Chronic Kidney Disease (CKD) Risk Assessment

> **Academic AI Mini-Project for Artificial Intelligence Subject Competition**  
> *Developed using Classical Symbolic AI, Declarative Knowledge Bases, Forward & Backward Chaining, Kleene 3-Valued Logic, and Interactive Proof Graphs.*

---

## 🔬 Project Overview

**RenalLogic AI** is an explainable clinical decision-support prototype that evaluates Chronic Kidney Disease (CKD) risk using symbolic expert-system reasoning. Instead of opaque neural networks that output ungrounded confidence scores, RenalLogic AI demonstrates pure, deterministic symbolic AI:
- **Declarative Knowledge Base**: Clinical rules stored in a clean, version-controlled JSON catalog directly derived from the **KDIGO 2024 Clinical Practice Guideline** and **NIDDK guidance**.
- **Separation of Concerns**: Standalone, framework-independent Python inference engine (`engine.py`, `forward_chaining.py`, `backward_chaining.py`) with zero coupling to the web framework.
- **Working Memory & Fact Provenance**: Explicitly segregates user observations, rule-derived conclusions, and unknown facts.
- **Kleene 3-Valued Logic**: Handles missing clinical data under uncertainty ($\{\text{TRUE}, \text{FALSE}, \text{UNKNOWN}\}$)—missing facts are **never** falsely assumed to be negative.
- **Data-Driven Forward Chaining**: Match-Resolve-Act cycle with agenda prioritization, deterministic conflict resolution, cycle avoidance, and step-by-step trace generation.
- **Goal-Driven Backward Chaining**: Recursive hypothesis verification with loop detection, proof tree construction, and explicit three-state output (`SUPPORTED`, `NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE`, `UNDETERMINED`).
- **Interactive Proof Graph**: Real-time `@xyflow/react` graph rendering causal dependencies from observations through production rules to risk classifications, complete with an interactive node inspection drawer.
- **The KDIGO >3 Months Chronicity Rule**: Strict clinical guardrail ensuring single abnormal lab results are never represented as chronic kidney disease without persistence documentation.

---

## 🏛️ System Architecture

```
RenalLogicAI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── engine.py              # WorkingMemory, Condition, Rule, 3-Valued Kleene Logic
│   │   ├── forward_chaining.py    # Data-driven forward inference & graph builder
│   │   ├── backward_chaining.py   # Goal-driven recursive backward reasoner
│   │   ├── knowledge_base.json    # 25+ KDIGO 2024 verified declarative rules
│   │   ├── sample_cases.py        # 8 curated competition benchmark scenarios
│   │   ├── schemas.py             # Pydantic request & response contracts
│   │   └── main.py                # FastAPI REST service & CORS middleware
│   ├── tests/
│   │   ├── test_engine.py         # Working memory & 3-valued logic unit tests
│   │   ├── test_forward_chaining.py # Forward chainer & conflict resolution tests
│   │   ├── test_backward_chaining.py# Backward chainer & cycle avoidance tests
│   │   ├── test_kdigo_scenarios.py# 8 clinical benchmark verification tests
│   │   └── test_api.py            # FastAPI HTTP endpoint tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Academic branding & navigation
│   │   │   ├── SafetyNotice.tsx   # KDIGO 2024 educational disclaimer
│   │   │   ├── InferenceSelector.tsx # Forward vs Backward chaining toggle & goal selector
│   │   │   ├── AssessmentForm.tsx # Patient input form with numerical validation & unit badges
│   │   │   ├── ResultsOverview.tsx# Staging cards, KDIGO risk badge & working memory state
│   │   │   ├── TraceExplorer.tsx  # Step-by-step rule firing timeline & condition match details
│   │   │   ├── ReasoningGraph.tsx # Interactive @xyflow/react proof graph with Node Inspector
│   │   │   ├── CaseLaboratory.tsx # 8 one-click competition test cases
│   │   │   ├── RulesExplorer.tsx  # Knowledge base viewer with category & search filters
│   │   │   ├── PrintableReport.tsx# Printable formal clinical summary with local Case ID
│   │   │   └── AboutModal.tsx     # Full AI methodology & system documentation
│   │   ├── services/
│   │   │   └── api.ts             # Typed API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces & types
│   │   ├── App.tsx                # Master dashboard container
│   │   ├── main.tsx               # React application root
│   │   └── index.css              # Tailwind directives & print media styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts             # Vite dev server with proxy to backend
│   └── tailwind.config.js
├── docs/
│   ├── ARCHITECTURE.md            # Detailed software architecture & data flows
│   ├── AI_METHODOLOGY.md          # Classical AI theory, algorithms, and 3-valued logic
│   ├── RULE_BASE.md               # Comprehensive KDIGO 2024 rule base documentation
│   ├── TESTING.md                 # Automated test suite execution & verification report
│   └── DEMO_SCRIPT.md             # Step-by-step presentation script for the professor
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start Guide (Windows)

### 🚀 Option A: 1-Click Automated Launch (Recommended)

Simply double-click:
```cmd
D:\RenalLogicAI\START_RENALLOGIC_AI.bat
```
This launcher checks prerequisites, launches the backend and frontend in separate dedicated windows (or reuses active instances), and automatically opens `http://127.0.0.1:5173/` in your default browser.

To stop the servers cleanly, double-click:
```cmd
D:\RenalLogicAI\STOP_RENALLOGIC_AI.bat
```

---

### 🛠️ Option B: Manual Terminal Launch

#### Prerequisites
- **Python 3.11+** installed
- **Node.js v18+** and **npm** installed

---

#### 1. Backend Setup & Run

Open a terminal (PowerShell or Command Prompt):

```powershell
# Navigate to the backend directory
cd d:\RenalLogicAI\backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Run backend unit test suite (20 tests)
pytest -v ..\backend\tests

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend API will be live at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).*

---

### 2. Frontend Setup & Run

Open a second terminal:

```powershell
# Navigate to the frontend directory
cd d:\RenalLogicAI\frontend

# Install frontend dependencies
npm install

# (Optional) Verify TypeScript compilation and production build
npm run build

# Start the Vite development server
npm run dev
```
*Open your browser and navigate to **`http://127.0.0.1:5173/`** to interact with the full application.*

---

## 🧪 Test Case Laboratory (Competition Benchmarks)

RenalLogic AI includes 8 curated demonstration scenarios directly accessible from the **Test Laboratory** tab:
1. **CASE_1: Confirmed Chronic Impairment (High Risk)**: eGFR 42 (G3b), UACR 120 (A2), persistent $\ge 3$ months. Demonstrates full forward cascade to Very High Risk.
2. **CASE_2: Reduced eGFR with Unknown Chronicity**: eGFR 38 (G3b), persistence unknown. Demonstrates the **KDIGO 3-month chronicity rule**: warns that single abnormal test does not diagnose CKD and flags for 3-month retesting.
3. **CASE_3: Severe Albuminuria with Preserved eGFR**: eGFR 95 (G1), UACR 450 (A3). Proves independent risk escalation and nephrology referral triggered by severe albumin leakage.
4. **CASE_4: Suspected Acute Kidney Injury (Non-Persistent)**: eGFR 28 (G4), chronicity = No. Distinguishes Acute Kidney Injury (AKI) from chronic staging.
5. **CASE_5: Normal Reference Baseline**: eGFR 102 (G1), UACR 8 (A1). Validates negative control and absence of false alarms.
6. **CASE_6: Risk Factors Present Without Abnormal Markers**: eGFR 88, UACR 18 with Diabetes and Hypertension. Demonstrates dual-layer reasoning between functional damage and epidemiological risk factors.
7. **CASE_7: Missing Laboratory Values (High Uncertainty)**: Demonstrates Kleene 3-valued logic. Staging rules do NOT fire; backward chaining evaluates to `UNDETERMINED` with explicit missing premise diagnostics.
8. **CASE_8: Severe End-Stage Renal Failure**: eGFR 9 (G5), UACR 850 (A3). Demonstrates rapid priority firing of multi-system alerts and urgent nephrology referral.

---

## 📚 Technical Documentation

- **[System Architecture](docs/ARCHITECTURE.md)**: Layered component design, decoupled Python engine, REST interfaces, and React Flow integration.
- **[AI Methodology](docs/AI_METHODOLOGY.md)**: Classical rule-based theory, Match-Resolve-Act cycle, Kleene 3-valued logic, and recursive backward proof trees.
- **[Knowledge Base Specification](docs/RULE_BASE.md)**: Complete catalog of production rules, KDIGO 2024 citations, and condition definitions.
- **[Verification & Testing](docs/TESTING.md)**: Automated test logs, 100% pytest pass rate, and build verification.
- **[Professor Presentation Script](docs/DEMO_SCRIPT.md)**: 5-minute step-by-step demonstration walkthrough for the AI subject competition.

---

## ⚖️ Medical Scope & Ethical Safety Disclaimer

> **EDUCATIONAL & RESEARCH USE ONLY**:  
> RenalLogic AI is an educational prototype developed for an Artificial Intelligence subject competition. It is **not** an approved medical device, diagnostic tool, or clinical decision support system for patient care. It does not provide medical diagnoses, treatment plans, or drug prescriptions.  
> Per **KDIGO 2024 Clinical Practice Guidelines**, any clinical evaluation of chronic kidney disease requires verified persistence of abnormalities for at least **three months** and formal consultation with a licensed physician or board-certified nephrologist.
