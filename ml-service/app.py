from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import uvicorn

from core.schemas import StudentBatch, PredictionResponse
from core.model_loader import ModelLoader
from core.preprocessing import Preprocessor
from core.predicter import Predictor
from core.rule_engine import RuleBasedRiskEvaluator
from core.recommender import RecommendationEngine
from core.explainer import Explainer
from core.shap import SHAPExplainer



app = FastAPI(title="FutureGuard ML Service", version="0.1.0")


class InferenceService:
  def __init__(self):
    self.model_loader = ModelLoader()
    self.preprocessor = Preprocessor(self.model_loader)
    self.predictor = Predictor(self.model_loader)
    self.rule_engine = RuleBasedRiskEvaluator()
    self.recommender = RecommendationEngine()
    self.explainer = Explainer()
    self.shap_explainer = SHAPExplainer(self.model_loader)

  @staticmethod
  def risk_bucket(score: float) -> str:
    if score > 0.7:
      return "high"
    if score > 0.5:
      return "medium"
    return "low"

  def predict_batch(self, batch: StudentBatch):
    rows = [s.features for s in batch.students]

    model_df = self.preprocessor.preprocess(rows)
    risk_scores = self.predictor.predict(model_df)

    results = []
    severity = {"low": 1, "medium": 2, "high": 3}

    for idx, (student, score) in enumerate(zip(batch.students, risk_scores)):
      ml_risk = self.risk_bucket(score)

      rule_result = self.rule_engine.evaluate(student.features)
      rule_risk = rule_result["risk"]

      final_risk = (
        rule_risk
        if severity[rule_risk] > severity[ml_risk]
        else ml_risk
      )

      row_df = model_df.iloc[[idx]]
      shap_summary = self.shap_explainer.top_contributors(row_df)

      explanation = self.explainer.explain(
        student.features,
        rule_result,
        ml_risk,
        score,
        shap_summary
      )

      recommendation = self.recommender.recommend(
        score,
        final_risk,
        student.features,
        shap_summary
      )

      results.append({
        "id": student.id,
        "risk_score": round(score, 4),
        "risk_label": final_risk,
        "explanation": explanation,
        "recommendation": recommendation
      })

    return {"results": results}


service = InferenceService()


@app.post("/predict", response_model=PredictionResponse)
def predict(batch: StudentBatch):
  return service.predict_batch(batch)


@app.get("/health")
def health_check():
  return {"status": "ok"}


@app.on_event("startup")
def preload_models():
  service.model_loader.load_predictor()
  service.model_loader.load_scaler()
  service.shap_explainer.explainer


if __name__ == "__main__":
  uvicorn.run(app, host="localhost")
