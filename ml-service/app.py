from fastapi import FastAPI
from core.schemas import StudentBatch, PredictionResponse, ExplanationResponse, RecommendationResponse
from core import predicter, explainer, recommender
app = FastAPI(title="FutureGuard ML Service", version="0.1.0")

@app.post("/predict", response_model=PredictionResponse)
def predict(data: StudentBatch):
  """
  Accepts student JSON batch, returns risk predictions.
  """
  preds = predicter.predict(data)
  return {"predictions": preds}

@app.post("/explain", response_model=ExplanationResponse)
def explain(data: StudentBatch):
  """
  Accepts student JSON batch, returns SHAP/LIME explanations.
  """
  explanations = explainer.explain(data.students)
  return {"explanations": explanations}

@app.post("/recommend", response_model=RecommendationResponse)
def recommend(data: StudentBatch):
  """
  Accepts student JSON batch, returns counseling recommendations.
  """
  recs = recommender.recommend(data.students)
  return {"recommendations": recs}

@app.get("/health")
def health_check():
  return {"status": "ok"}
