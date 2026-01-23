import pandas as pd
from typing import List, Optional

from core.model_loader import ModelLoader


class Predictor:
  def __init__(self, model_loader: Optional[ModelLoader] = None):
    self.model_loader = model_loader or ModelLoader()
    self._model = None

  def load_model(self):
    if self._model is None:
      self._model = self.model_loader.load_predictor()
    return self._model

  def predict(self, features_df: pd.DataFrame) -> List[float]:
    model = self.load_model()
    probs = model.predict_proba(features_df)
    return probs[:, 1].tolist()
