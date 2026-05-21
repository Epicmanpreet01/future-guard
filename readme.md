# FutureGuard

FutureGuard is a full-stack **student dropout risk prediction and intervention platform** designed for educational institutions.
It combines **centralized metadata-driven ingestion**, a **deterministic rule-based risk engine**, **machine learning predictions**, and **model explainability (SHAP)** to identify at-risk students early and provide **transparent, actionable insights**.

The platform is built with a **role-based architecture** (SuperAdmin, Admin, Mentor), real-time aggregations, and a **decoupled ML microservice** for scalable inference.
The entire system is **production-deployed on Render**.

---

## Live Deployment

**Application URL:** https://futureguard.onrender.com

### **Credentials for each role: (Testing)**
### 1) Super Admin:
Email: superadmin@gmail.com

Password: Superadmin@123

### 2) Admin:
Email: admin@gmail.com

Password: Admin@123

### 3) Mentor:
Email: mentor@gmail.com 

Password: Mentor@123

---

## Key Features

### 1. Centralized Metadata-Driven Ingestion

* No institute-specific schemas or per-client configuration
* Single global metadata schema stored in MongoDB
* Automatic column normalization using:

  * Canonical field keys
  * Display names
  * Synonyms and common naming variations
* Supports CSV and Excel uploads
* Strong validation with early failure on missing required fields

---

### 2. Hybrid Risk Evaluation Engine

FutureGuard uses a **hybrid risk strategy** to ensure reliability, interpretability, and fairness.

#### Rule-Based Engine

* Deterministic checks on:

  * Attendance
  * CGPA
  * Fees status
* Produces **human-readable explanations**
* Guarantees predictable outcomes for critical thresholds

#### Machine Learning Engine

* XGBoost-based classifier
* Outputs dropout probability
* Uses a standardized, metadata-aligned feature vector
* Hosted models dynamically loaded at runtime

**Final Risk Decision**

```
final_risk = max(rule_based_risk, ml_risk)
```

This ensures **high-risk students are never missed**, even if ML confidence is lower.

---

### 3. Explainable Predictions (SHAP)

FutureGuard integrates **SHAP (SHapley Additive exPlanations)** for transparent ML interpretability.

Each prediction includes:

* Feature-level SHAP contributions
* Positive and negative impact on risk score
* Top contributing risk factors
* Alignment with rule-based explanations

This ensures:

* No black-box predictions
* Trust for mentors and administrators
* Clear justification for interventions

---

### 4. Role-Based Dashboards

**SuperAdmin**

* System-wide aggregations
* Cross-institute success tracking
* Platform-level performance insights

**Admin**

* Mentor management
* Institute-level analytics
* Risk trend monitoring

**Mentor**

* Upload student data
* Identify high-risk students
* View SHAP-based explanations per student
* Track improvement and success cases
* Access actionable recommendations

---

### 5. Real-Time Aggregations

* Risk distribution (High / Medium / Low)
* Success tracking (risk reduction over time)
* Automatic propagation:

```
Mentor → Admin → SuperAdmin
```

* Fully consistent across re-uploads and student updates

---

### 6. Explainable & Actionable Outputs

Each prediction includes:

* ML risk bucket
* Rule-based risk bucket
* SHAP feature importance
* Explicit rule triggers
* Personalized recommendations

Designed for **intervention**, not just prediction.

---

## Architecture Overview

### Backend (Node.js + Express)

* File upload handling
* Metadata normalization and validation
* Student persistence and updates
* Aggregation propagation
* Secure integration with ML service

### ML Service (FastAPI)

* Stateless inference microservice
* Feature preprocessing and scaling
* XGBoost probability prediction
* Rule-based risk evaluation
* **SHAP-based explanation generation**
* Recommendation engine

### Frontend (React + Tailwind + Recharts)

* Mentor dashboard
* Analytics and drill-downs
* Upload history tracking
* Interactive charts:

  * Risk distribution
  * Success vs high-risk comparison
  * Feature-level & SHAP-driven insights

---

## ML Service API

### `POST /predict`

#### Request

```json
{
  "students": [
    {
      "id": "STU001",
      "features": {
        "attendancePercentage": 62,
        "cgpa": 5.8,
        "feesPaid": false,
        "previousYearPerformance": 55
      }
    }
  ]
}
```

#### Response

```json
{
  "results": [
    {
      "id": "STU001",
      "risk_score": 0.73,
      "risk_label": "high",
      "explanation": {
        "ml_risk": "high",
        "rule_risk": "medium",
        "rule_reasons": ["Fees pending", "Attendance below 60%"],
        "shap_values": {
          "attendancePercentage": 0.21,
          "cgpa": 0.18,
          "feesPaid": 0.14
        }
      },
      "recommendation": "Increase study hours and attend mentoring sessions."
    }
  ]
}
```

---

## Risk Logic

### Rule-Based Thresholds

**High Risk**

* Attendance < 50%
* CGPA < 3

**Medium Risk**

* Fees pending
* Attendance < 60%
* CGPA < 6

**Low Risk**

* None of the above

---

### Success Definition

A student is marked as a **success case** when:

* Previous risk ∈ {High, Medium}
* Current risk = Low

---

## Dataset Used

The ML models were trained using the **UCI Machine Learning Repository dataset**:

**Predict Students Dropout and Academic Success**
[https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success](https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success)

The dataset was cleaned, standardized, and mapped to FutureGuard’s unified feature schema for training, validation, and SHAP analysis.

---

## Model Hosting & Loading

* Trained ML models are hosted on **Hugging Face**
* SHAP-compatible models are dynamically loaded at runtime

**Model Repository:**
[https://huggingface.co/Epicmanpreet02/futureguard-ml-models](https://huggingface.co/Epicmanpreet02/futureguard-ml-models)

---

## Repository Structure & Git-Ignored Assets

To keep the repository clean and secure:

* Model training notebooks
* Raw and processed datasets
* Serialized ML models

are **intentionally git-ignored**.

Only inference logic, preprocessing pipelines, SHAP explainability code, and API contracts are included.

---

## Data Privacy & Safety

* No raw student files are stored
* Only validated, standardized fields are persisted
* Student identifiers are scoped per institute
* ML service is stateless and isolated
* Explainability outputs do not expose sensitive raw data

---

## Project Status

### Completed

* Centralized metadata system
* Upload normalization pipeline
* Rule-based + ML hybrid prediction
* **SHAP-based explainability**
* Aggregation propagation
* Mentor dashboard and analytics
* Upload history and success tracking
* **Production deployment on Render**

### Planned

* Automated retraining pipelines
* Longitudinal risk analytics
* Alerting & intervention workflows
* CI/CD hardening
* Advanced explainability visualizations

---

## Tech Stack

**Frontend**

* React
* Tailwind CSS
* Recharts

**Backend**

* Node.js
* Express
* MongoDB (Mongoose)

**ML Service**

* FastAPI
* XGBoost
* SHAP
* Pandas
* Scikit-learn
* Joblib

---

## License

This project (including associated ML models) is released under a **proprietary license**.
See the [`LICENSE`](./LICENSE) file for full terms and conditions.
