import pandas as pd
from core.model_loader import load_predictor

_model = None


def load_model():
  global _model
  if _model is None:
    _model = load_predictor()
  return _model


def predict(features_df: pd.DataFrame) -> list[float]:
  model = load_model()
  probs = model.predict_proba(features_df)
  return probs[:, 1].tolist()
