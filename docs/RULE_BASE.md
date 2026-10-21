# RenalLogic AI: Knowledge Base & Rule Specification

## 1. Clinical Context & Authoritative References

RenalLogic AI codifies clinical evaluation guidelines directly from:
1. **KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease**, Kidney International Supplements, 2024.
2. **National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)**: Guidance on Evaluation and Testing for Chronic Kidney Disease.

---

## 2. KDIGO Definition of Chronic Kidney Disease

Under KDIGO 2024 Chapter 1, CKD is defined as **abnormalities of kidney structure or function, present for $> 3$ months, with implications for health**.

### Mandatory Diagnostic Criteria (Must persist $> 3$ months):
- **Decreased GFR**: $\text{eGFR} < 60 \text{ mL/min/1.73 m}^2$ (GFR categories G3a–G5)
- **Markers of Kidney Damage (one or more)**:
  - Albuminuria ($\text{AER} \ge 30 \text{ mg/24 hours}$ or $\text{UACR} \ge 30 \text{ mg/g}$ [$\ge 3 \text{ mg/mmol}$])
  - Urine sediment abnormalities
  - Electrolyte disorders due to tubular disease
  - Structural abnormalities on renal imaging

> [!IMPORTANT]
> **The 3-Month Chronicity Rule**: An abnormal laboratory reading on a single test does **not** confirm CKD. If duration is $< 3$ months or unknown, the abnormality may represent Acute Kidney Injury (AKI), acute volume depletion, or transient albuminuria.

---

## 3. KDIGO Prognosis Heat Map (The Risk Grid)

| eGFR Category | Description | A1: Normal/Mild (< 30 mg/g) | A2: Moderate (30–300 mg/g) | A3: Severe (> 300 mg/g) |
| :---: | :---: | :---: | :---: | :---: |
| **G1** ($\ge 90$) | Normal or High | **Low (Green)** | **Moderate (Yellow)** | **High (Orange)** |
| **G2** ($60\text{--}89$) | Mildly Decreased | **Low (Green)** | **Moderate (Yellow)** | **High (Orange)** |
| **G3a** ($45\text{--}59$) | Mild to Moderate | **Moderate (Yellow)** | **High (Orange)** | **Very High (Red)** |
| **G3b** ($30\text{--}44$) | Moderate to Severe | **High (Orange)** | **Very High (Red)** | **Very High (Red)** |
| **G4** ($15\text{--}29$) | Severely Decreased | **Very High (Red)** | **Very High (Red)** | **Very High (Red)** |
| **G5** ($< 15$) | Kidney Failure | **Very High (Red)** | **Very High (Red)** | **Very High (Red)** |

---

## 4. Production Rule Catalog

### A. Glomerular Filtration Rate (eGFR) Staging Rules (Priority 10)
- `R_GFR_G1`: `egfr >= 90` $\implies$ `egfr_stage = "G1"` (Normal or High)
- `R_GFR_G2`: `egfr >= 60 AND egfr < 90` $\implies$ `egfr_stage = "G2"` (Mildly Decreased)
- `R_GFR_G3A`: `egfr >= 45 AND egfr < 60` $\implies$ `egfr_stage = "G3a"` (Mildly to Moderately Decreased)
- `R_GFR_G3B`: `egfr >= 30 AND egfr < 45` $\implies$ `egfr_stage = "G3b"` (Moderately to Severely Decreased)
- `R_GFR_G4`: `egfr >= 15 AND egfr < 30` $\implies$ `egfr_stage = "G4"` (Severely Decreased)
- `R_GFR_G5`: `egfr < 15` $\implies$ `egfr_stage = "G5"` (Kidney Failure)

### B. Albuminuria (UACR) Staging Rules (Priority 10)
- `R_ACR_A1`: `uacr < 30` $\implies$ `uacr_stage = "A1"` (Normal to Mildly Increased)
- `R_ACR_A2`: `uacr >= 30 AND uacr <= 300` $\implies$ `uacr_stage = "A2"` (Moderately Increased)
- `R_ACR_A3`: `uacr > 300` $\implies$ `uacr_stage = "A3"` (Severely Increased)

### C. Marker Analysis Rules (Priority 20–25)
- `R_MARKER_GFR_ABNORMAL`: `egfr_stage in ["G3a", "G3b", "G4", "G5"]` $\implies$ `has_abnormal_gfr = True`
- `R_MARKER_ACR_ABNORMAL`: `uacr_stage in ["A2", "A3"]` $\implies$ `has_abnormal_acr = True`
- `R_MARKER_ANY_ABNORMAL_GFR`: `has_abnormal_gfr == True` $\implies$ `has_abnormal_marker = True`
- `R_MARKER_ANY_ABNORMAL_ACR`: `has_abnormal_acr == True` $\implies$ `has_abnormal_marker = True`
- `R_MARKER_NORMAL_BOUNDS`: `egfr_stage in ["G1", "G2"] AND uacr_stage == "A1"` $\implies$ `has_abnormal_marker = False`

### D. Chronicity & Duration Verification Rules (Priority 30)
- `R_CHRON_CONFIRMED`: `has_abnormal_marker == True AND chronicity_ge_3m == "yes"` $\implies$ `chronicity_status = "Confirmed_Persistent"`
- `R_CHRON_ACUTE_OR_UNCONFIRMED`: `has_abnormal_marker == True AND chronicity_ge_3m == "no"` $\implies$ `chronicity_status = "Acute_or_Unconfirmed"`
- `R_CHRON_UNKNOWN_PERSISTENCE`: `has_abnormal_marker == True AND (chronicity_ge_3m is_unknown OR == "unknown")` $\implies$ `chronicity_status = "Unknown_Persistence"`
- `R_CHRON_NOT_APPLICABLE`: `has_abnormal_marker == False` $\implies$ `chronicity_status = "Not_Applicable_Normal_Markers"`

### E. KDIGO Composite Risk Matrix Rules (Priority 40)
- **Low Risk (Green Zone)**:
  - `R_RISK_G1_A1`: `egfr_stage == "G1" AND uacr_stage == "A1"` $\implies$ `kdigo_risk_category = "Low"`
  - `R_RISK_G2_A1`: `egfr_stage == "G2" AND uacr_stage == "A1"` $\implies$ `kdigo_risk_category = "Low"`
- **Moderate Risk (Yellow Zone)**:
  - `R_RISK_G1_A2`: `egfr_stage == "G1" AND uacr_stage == "A2"` $\implies$ `kdigo_risk_category = "Moderate"`
  - `R_RISK_G2_A2`: `egfr_stage == "G2" AND uacr_stage == "A2"` $\implies$ `kdigo_risk_category = "Moderate"`
  - `R_RISK_G3A_A1`: `egfr_stage == "G3a" AND uacr_stage == "A1"` $\implies$ `kdigo_risk_category = "Moderate"`
- **High Risk (Orange Zone)**:
  - `R_RISK_G3B_A1`: `egfr_stage == "G3b" AND uacr_stage == "A1"` $\implies$ `kdigo_risk_category = "High"`
  - `R_RISK_G3A_A2`: `egfr_stage == "G3a" AND uacr_stage == "A2"` $\implies$ `kdigo_risk_category = "High"`
  - `R_RISK_G1_A3`: `egfr_stage == "G1" AND uacr_stage == "A3"` $\implies$ `kdigo_risk_category = "High"`
  - `R_RISK_G2_A3`: `egfr_stage == "G2" AND uacr_stage == "A3"` $\implies$ `kdigo_risk_category = "High"`
- **Very High Risk (Red Zone)**:
  - `R_RISK_G4_ANY`: `egfr_stage == "G4"` $\implies$ `kdigo_risk_category = "Very_High"`
  - `R_RISK_G5_ANY`: `egfr_stage == "G5"` $\implies$ `kdigo_risk_category = "Very_High"`
  - `R_RISK_G3B_A2`: `egfr_stage == "G3b" AND uacr_stage == "A2"` $\implies$ `kdigo_risk_category = "Very_High"`
  - `R_RISK_G3A_A3`: `egfr_stage == "G3a" AND uacr_stage == "A3"` $\implies$ `kdigo_risk_category = "Very_High"`
  - `R_RISK_G3B_A3`: `egfr_stage == "G3b" AND uacr_stage == "A3"` $\implies$ `kdigo_risk_category = "Very_High"`

### F. Clinical Assessment Synthesis Rules (Priority 50)
- `R_ASSESS_CONFIRMED_CKD`: `chronicity_status == "Confirmed_Persistent" AND kdigo_risk_category in ["Moderate", "High", "Very_High"]` $\implies$ `assessment_summary = "Confirmed_CKD_Criteria_Met"`
- `R_ASSESS_UNCONFIRMED_CHRONICITY`: `chronicity_status == "Unknown_Persistence" AND kdigo_risk_category in ["Moderate", "High", "Very_High"]` $\implies$ `assessment_summary = "Abnormal_Markers_Chronicity_Unverified"`
- `R_ASSESS_ACUTE_SUSPECTED`: `chronicity_status == "Acute_or_Unconfirmed" AND has_abnormal_marker == True` $\implies$ `assessment_summary = "Acute_Kidney_Abnormality_Suspected"`
- `R_ASSESS_NORMAL_STATUS`: `has_abnormal_marker == False AND kdigo_risk_category == "Low"` $\implies$ `assessment_summary = "No_Current_Laboratory_Evidence_of_CKD"`

### G. Etiological Modifier Rules (Priority 60)
- `R_ETIOLOGY_DIABETES`: `diabetes == "yes"` $\implies$ `diabetic_nephropathy_risk = "Elevated_Diabetic_Etiology"`
- `R_ETIOLOGY_HYPERTENSION`: `hypertension == "yes"` $\implies$ `hypertensive_risk_factor = "Cardiovascular_Hypertensive_Comorbidity"`

### H. Clinical Action & Referral Directives (Priority 70–75)
- `R_REC_NEPHROLOGY_REFERRAL`: `egfr_stage in ["G4", "G5"]` $\implies$ `nephrology_referral_indicated = True`
- `R_REC_NEPHROLOGY_REFERRAL_ACR3`: `uacr_stage == "A3"` $\implies$ `nephrology_referral_indicated = True`
- `R_REC_MONITOR_ANNUAL`: `kdigo_risk_category in ["Low", "Moderate"]` $\implies$ `recommended_monitoring_frequency = "At least 1x per year"`
- `R_REC_MONITOR_HIGH`: `kdigo_risk_category == "High"` $\implies$ `recommended_monitoring_frequency = "2x per year"`
- `R_REC_MONITOR_VERY_HIGH`: `kdigo_risk_category == "Very_High"` $\implies$ `recommended_monitoring_frequency = "3-4x per year (or per nephrologist guidance)"`
