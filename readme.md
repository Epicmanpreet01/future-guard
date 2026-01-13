# FutureGuard

FutureGuard is a full-stack **student dropout risk prediction and intervention platform** designed for educational institutions.
It combines **centralized metadata-driven ingestion**, a **deterministic rule-based risk engine**, and **machine learning predictions** to identify at-risk students early and provide actionable, explainable insights.

The platform is built with a **role-based architecture** (SuperAdmin, Admin, Mentor), real-time aggregations, and a **decoupled ML microservice** for scalable inference.

---

## Key Features

### 1. Centralized Metadata-Driven Ingestion

- No institute-specific schemas or per-client configuration
- Single global metadata schema stored in MongoDB
- Automatic column normalization using:

  - Canonical field keys
  - Display names
  - Synonyms and common naming variations

- Supports CSV and Excel uploads
- Strong validation with early failure on missing required fields

---

### 2. Hybrid Risk Evaluation Engine

FutureGuard uses a **hybrid risk strategy** to ensure reliability and transparency:

#### Rule-Based Engine

- Deterministic checks on:

  - Attendance
  - CGPA
  - Fees status

- Produces human-readable explanations

#### Machine Learning Engine

- XGBoost-based classifier
- Outputs dropout probability
- Uses a standardized feature vector

**Final Risk Decision**

```
final_risk = max(rule_based_risk, ml_risk)
```

---

### 3. Role-Based Dashboards

**SuperAdmin**

- System-wide aggregations
- Cross-institute success tracking

**Admin**

- Mentor management
- Institute-level analytics

**Mentor**

- Upload student data
- Identify high-risk students
- Track improvement and success cases
- View per-student explanations and recommendations

---

### 4. Real-Time Aggregations

- Risk distribution (High / Medium / Low)
- Success tracking (risk reduction over time)
- Automatic propagation:

  ```
  Mentor → Admin → SuperAdmin
  ```

- Fully consistent across re-uploads and updates

---

### 5. Explainable Predictions

Each prediction includes:

- ML risk bucket
- Rule-based risk bucket
- Explicit rule triggers
- Actionable recommendations

No black-box outputs.

---

## Architecture Overview

### Backend (Node.js + Express)

- File upload handling
- Metadata normalization and validation
- Student persistence and updates
- Aggregation propagation
- ML service integration

### ML Service (FastAPI)

- Stateless inference microservice
- Feature preprocessing and scaling
- XGBoost probability prediction
- Rule-based risk evaluation
- Explanation and recommendation generation

### Frontend (React + Tailwind + Recharts)

- Mentor dashboard
- Analytics and drill-downs
- Upload history tracking
- Interactive charts:

  - Risk distribution
  - Success vs high-risk comparison
  - Feature-level breakdowns

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
        "rule_reasons": ["Fees pending", "Attendance below 60%"]
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

- Attendance < 50%
- CGPA < 3

**Medium Risk**

- Fees pending
- Attendance < 60%
- CGPA < 6

**Low Risk**

- None of the above

---

### Success Definition

A student is marked as a **success case** when:

- Previous risk ∈ {High, Medium}
- Current risk = Low

---

## Dataset Used

The ML models were trained using the **UCI Machine Learning Repository dataset**:

**Predict Students Dropout and Academic Success**
[https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success](https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success)

The dataset was cleaned, standardized, and mapped to FutureGuard’s unified feature schema for model training and validation.

---

## Model Hosting & Loading

- Trained ML models are hosted on **Hugging Face**
- The ML service dynamically loads models from this repository at runtime

**Model Repository:**
[https://huggingface.co/Epicmanpreet02/futureguard-ml-models](https://huggingface.co/Epicmanpreet02/futureguard-ml-models)

---

## Repository Structure & Git-Ignored Assets

To keep the repository clean and secure:

- Model training notebooks
- Raw and processed datasets
- Serialized ML models

are **intentionally git-ignored**.

Only inference logic, preprocessing code, and API contracts are included in this repository.

---

## Data Privacy & Safety

- No raw student files are stored
- Only validated, standardized fields are persisted
- Student identifiers are scoped per institute
- ML service is stateless and isolated

---

## Project Status

### Completed

- Centralized metadata system
- Upload normalization pipeline
- Rule-based + ML hybrid prediction
- Aggregation propagation
- Mentor dashboard and analytics
- Upload history and success tracking

### Planned

- Automated retraining
- Advanced explainability (SHAP/LIME)
- Longitudinal analytics
- Alerting and intervention workflows
- CI/CD and deployment hardening

---

## Tech Stack

**Frontend**

- React
- Tailwind CSS
- Recharts

**Backend**

- Node.js
- Express
- MongoDB (Mongoose)

**ML Service**

- FastAPI
- XGBoost
- Pandas
- Scikit-learn
- Joblib

---

## License

This project (including associated ML models) is released under a **proprietary license**.
See the [`LICENSE`](./LICENSE) file for full terms and conditions.
