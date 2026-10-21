"""
RenalLogic AI - Curated Academic Demonstration Cases
Illustrative Fictional Test Scenarios for AI Subject Competition Presentation.
Designed to demonstrate forward chaining, backward chaining, handling of unknown facts,
and KDIGO 2024 chronicity rules.
"""

from typing import Any, Dict, List

SAMPLE_CASES: List[Dict[str, Any]] = [
    {
        "id": "CASE_1",
        "title": "Confirmed Chronic Impairment (KDIGO High Risk)",
        "subtitle": "eGFR 42 (G3b), UACR 120 (A2), Persistent >= 3 Months",
        "category": "Persistent CKD",
        "inputs": {
            "egfr": 42.0,
            "uacr": 120.0,
            "chronicity_ge_3m": "yes",
            "diabetes": "yes",
            "hypertension": "yes"
        },
        "target_hypothesis": {
            "fact": "assessment_summary",
            "value": "Confirmed_CKD_Criteria_Met"
        },
        "description": "Fictional case of an adult with documented reduced eGFR and moderate albuminuria confirmed across consecutive lab measurements spanning >3 months. Has co-existing diabetes and hypertension.",
        "expected_behavior": "Forward chaining fires R_GFR_G3B, R_ACR_A2, marker detection rules, R_CHRON_CONFIRMED, R_RISK_G3B_A2 (Very High Risk), and R_ASSESS_CONFIRMED_CKD. Backward chaining for 'assessment_summary == Confirmed_CKD_Criteria_Met' returns SUPPORTED.",
        "educational_notes": "Meets KDIGO 2024 definition of CKD: documented persistence of impaired filtration and structural damage for >3 months."
    },
    {
        "id": "CASE_2",
        "title": "Reduced eGFR with Unknown Chronicity",
        "subtitle": "eGFR 38 (G3b), UACR 15 (A1), Chronicity Unknown",
        "category": "Unknown Chronicity",
        "inputs": {
            "egfr": 38.0,
            "uacr": 15.0,
            "chronicity_ge_3m": "unknown",
            "diabetes": "no",
            "hypertension": "yes"
        },
        "target_hypothesis": {
            "fact": "assessment_summary",
            "value": "Confirmed_CKD_Criteria_Met"
        },
        "description": "An isolated laboratory reading shows eGFR 38 mL/min/1.73 m², but prior lab history is unavailable (unknown chronicity).",
        "expected_behavior": "System recognizes G3b stage, but chronicity rule fires R_CHRON_UNKNOWN_PERSISTENCE and R_ASSESS_UNCONFIRMED_CHRONICITY. Hypothesis for confirmed CKD returns NOT_SUPPORTED_BY_AVAILABLE_EVIDENCE or UNDETERMINED. System warns that single abnormal test does not diagnose CKD and recommends retesting at 3 months.",
        "educational_notes": "Highlights KDIGO 2024 safety principle: an abnormal single measurement must never be treated as definitive chronic disease without duration documentation."
    },
    {
        "id": "CASE_3",
        "title": "Severe Albuminuria with Unknown Chronicity",
        "subtitle": "eGFR 95 (G1), UACR 450 (A3), Chronicity Unknown",
        "category": "Isolated Albuminuria",
        "inputs": {
            "egfr": 95.0,
            "uacr": 450.0,
            "chronicity_ge_3m": "unknown",
            "diabetes": "yes",
            "hypertension": "unknown"
        },
        "target_hypothesis": {
            "fact": "nephrology_referral_indicated",
            "value": True
        },
        "description": "Preserved filtration (eGFR 95), but heavy albuminuria (A3 > 300 mg/g) detected in a diabetic patient without documented 3-month persistence.",
        "expected_behavior": "Fires R_GFR_G1, R_ACR_A3, R_RISK_G1_A3 (High Risk), and R_REC_NEPHROLOGY_REFERRAL_ACR3. Chronicity is flagged as unconfirmed, but high risk and nephrology referral indication are triggered by severe albumin leakage.",
        "educational_notes": "Demonstrates independent risk elevation and referral thresholds triggered by severe albuminuria (A3) even when eGFR remains >= 90."
    },
    {
        "id": "CASE_4",
        "title": "Suspected Acute Kidney Injury (Non-Persistent)",
        "subtitle": "eGFR 28 (G4), UACR 20 (A1), Chronicity = No (Recent Acute Drop)",
        "category": "Acute Abnormality",
        "inputs": {
            "egfr": 28.0,
            "uacr": 20.0,
            "chronicity_ge_3m": "no",
            "diabetes": "no",
            "hypertension": "no"
        },
        "target_hypothesis": {
            "fact": "assessment_summary",
            "value": "Acute_Kidney_Abnormality_Suspected"
        },
        "description": "Patient with sudden sharp drop in eGFR to 28 mL/min/1.73 m² known to be acute (< 3 months duration).",
        "expected_behavior": "System fires R_CHRON_ACUTE_OR_UNCONFIRMED and R_ASSESS_ACUTE_SUSPECTED. Rejects CKD diagnosis; warns of acute renal insult / AKI risk requiring urgent clinical evaluation rather than routine chronic staging.",
        "educational_notes": "Demonstrates real clinical AI logic: distinguishing Acute Kidney Injury from Chronic Kidney Disease using temporal criteria."
    },
    {
        "id": "CASE_5",
        "title": "Normal Reference Baseline",
        "subtitle": "eGFR 102 (G1), UACR 8 (A1), All Markers Normal",
        "category": "Normal Baseline",
        "inputs": {
            "egfr": 102.0,
            "uacr": 8.0,
            "chronicity_ge_3m": "unknown",
            "diabetes": "no",
            "hypertension": "no"
        },
        "target_hypothesis": {
            "fact": "kdigo_risk_category",
            "value": "Low"
        },
        "description": "Healthy individual with normal filtration rate and minimal urinary albumin excretion.",
        "expected_behavior": "Fires R_GFR_G1, R_ACR_A1, R_MARKER_NORMAL_BOUNDS, R_RISK_G1_A1 (Low Risk), and R_ASSESS_NORMAL_STATUS. Chronicity is deemed Not_Applicable_Normal_Markers. Recommended monitoring is annual screening.",
        "educational_notes": "Validates negative control / baseline safety. Normal parameters do not trigger alarmist false positives."
    },
    {
        "id": "CASE_6",
        "title": "Risk Factors Present Without Abnormal Markers",
        "subtitle": "eGFR 88 (G2), UACR 18 (A1), Diabetes & HTN Present",
        "category": "Risk Factors Only",
        "inputs": {
            "egfr": 88.0,
            "uacr": 18.0,
            "chronicity_ge_3m": "unknown",
            "diabetes": "yes",
            "hypertension": "yes"
        },
        "target_hypothesis": {
            "fact": "diabetic_nephropathy_risk",
            "value": "Elevated_Diabetic_Etiology"
        },
        "description": "Long-standing hypertensive diabetic individual whose current eGFR and UACR remain in the normal-to-mild range.",
        "expected_behavior": "Biochemical markers classify as Low KDIGO Risk (G2-A1), but etiological rules fire for diabetic and hypertensive surveillance. System highlights high risk of future renal decline despite normal current markers.",
        "educational_notes": "Shows dual-layer reasoning: separating functional/pathological damage from epidemiological risk factor surveillance."
    },
    {
        "id": "CASE_7",
        "title": "Missing Laboratory Values (High Uncertainty)",
        "subtitle": "eGFR missing, UACR missing, History of Diabetes only",
        "category": "Missing Data Handling",
        "inputs": {
            "egfr": None,
            "uacr": None,
            "chronicity_ge_3m": "unknown",
            "diabetes": "yes",
            "hypertension": "unknown"
        },
        "target_hypothesis": {
            "fact": "kdigo_risk_category",
            "value": "Low"
        },
        "description": "Incomplete clinical record where laboratory results were not entered or are pending.",
        "expected_behavior": "Engine does NOT assume missing lab values are normal or false. Staging rules do NOT fire. Backward chaining query for risk category evaluates to UNDETERMINED with explicit missing fact diagnostics. Only etiological rule fires for diabetes.",
        "educational_notes": "Crucial AI benchmark: demonstrates rigorous 3-valued Kleene logic under missing information. No silent fallback to default values."
    },
    {
        "id": "CASE_8",
        "title": "Severe End-Stage Renal Failure (G5)",
        "subtitle": "eGFR 9 (G5), UACR 850 (A3), Chronicity >= 3 Months",
        "category": "Critical Staging",
        "inputs": {
            "egfr": 9.0,
            "uacr": 850.0,
            "chronicity_ge_3m": "yes",
            "diabetes": "yes",
            "hypertension": "yes"
        },
        "target_hypothesis": {
            "fact": "nephrology_referral_indicated",
            "value": True
        },
        "description": "Fictional case of advanced kidney failure with critical reduction in filtration and nephrotic-range proteinuria.",
        "expected_behavior": "Fires R_GFR_G5, R_ACR_A3, R_RISK_G5_ANY (Very High Risk), R_ASSESS_CONFIRMED_CKD, R_REC_NEPHROLOGY_REFERRAL, and R_REC_MONITOR_VERY_HIGH. Backward chaining proves urgent nephrology referral is SUPPORTED.",
        "educational_notes": "Demonstrates rapid priority firing of multi-system alerts and urgent clinical action guidance."
    }
]
