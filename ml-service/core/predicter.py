import joblib
import os
import pandas as pd
import xgboost as xgb

MODEL_DIR = "models/predictor"
_model = None

def load_model():
  global _model
  if _model is None:
    models = sorted(os.listdir(MODEL_DIR))
    _model = joblib.load(os.path.join(MODEL_DIR, models[-1]))
  return _model

def predict(features_df: pd.DataFrame) -> list[float]:
  model = load_model()
  probs = model.predict_proba(features_df)
  return probs[:, 1].tolist()
