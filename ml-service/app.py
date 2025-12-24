from fastapi import FastAPI
import pandas as pd

from core.schemas import StudentBatch, PredictionResponse
from core import predicter
from core.explainer import explain
from core.recommender import recommend
from core.preprocessing import preprocess

app = FastAPI(title="FutureGuard ML Service", version="0.1.0")

def risk_bucket(score: float) -> str:
  if score > 0.7:
    return "high"
  if score > 0.4:
    return "medium"
  return "low"

@app.post("/predict", response_model=PredictionResponse)
def predict(batch: StudentBatch):

  rows = [s.features for s in batch.students]

  # 🔥 THIS is the key line
  model_df = preprocess(rows)

  risk_scores = predicter.predict(model_df)

  results = []
  for student, score in zip(batch.students, risk_scores):
    risk = risk_bucket(score)
    results.append({
      "id": student.id,
      "risk_score": round(score, 4),
      "risk_label": risk,
      "explanation": explain(student.features),
      "recommendation": recommend(score)
    })

  return {"results": results}


@app.get("/health")
def health_check():
  return {"status": "ok"}
