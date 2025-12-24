from fastapi import FastAPI
import pandas as pd
import uvicorn

from core.schemas import StudentBatch, PredictionResponse
from core import predicter
from core.explainer import explain
from core.recommender import recommend
from core.preprocessing import preprocess
from core.rule_engine import rule_based_risk

app = FastAPI(title="FutureGuard ML Service", version="0.1.0")

def risk_bucket(score: float) -> str:
  if score > 0.7:
    return "high"
  if score > 0.5:
    return "medium"
  return "low"

@app.post("/predict", response_model=PredictionResponse)
def predict(batch: StudentBatch):

  rows = [s.features for s in batch.students]

  model_df = preprocess(rows)

  risk_scores = predicter.predict(model_df)

  results = []

  severity = {"low": 1, "medium": 2, "high": 3}

  for student, score in zip(batch.students, risk_scores):
    ml_risk = risk_bucket(score)

    rule_result = rule_based_risk(student.features)
    rule_risk = rule_result["risk"]

    final_risk = (
      rule_risk
      if severity[rule_risk] > severity[ml_risk]
      else ml_risk
    )
    explanation = explain(
      student.features,
      rule_result,
      ml_risk,
      score
    )

    recommendation = recommend(
      score,
      final_risk,
      student.features
    )

    results.append({
      "id": student.id,
      "risk_score": round(score, 4),
      "risk_label": final_risk,
      "explanation": explanation,
      "recommendation": recommendation
    })

  return {"results": results}


@app.get("/health")
def health_check():
  return {"status": "ok"}

if __name__ == '__main__':
  uvicorn.run(app, host='localhost', port=8000)