import shap
import pandas as pd
import numpy as np
from typing import Dict, List

from core.model_loader import ModelLoader
from core.config import MODEL_FEATURE_ORDER


class SHAPExplainer:
  def __init__(self, model_loader: ModelLoader):
    self.model = model_loader.load_predictor()
    self.explainer = shap.TreeExplainer(self.model)

  def explain_row(self, features_df: pd.DataFrame) -> Dict[str, float]:
    """
    Returns per-feature SHAP contribution for class=1 (risk)
    """
    shap_values = self.explainer.shap_values(features_df)

    # Binary classifier → index 1
    if isinstance(shap_values, list):
      shap_values = shap_values[1]

    values = shap_values[0]

    return {
      feature: float(value)
      for feature, value in zip(MODEL_FEATURE_ORDER, values)
    }

  def top_contributors(
    self,
    features_df: pd.DataFrame,
    top_k: int = 5
  ) -> List[Dict]:
    shap_map = self.explain_row(features_df)

    ranked = sorted(
      shap_map.items(),
      key=lambda x: abs(x[1]),
      reverse=True
    )

    return [
      {
        "feature": feature,
        "impact": value,
        "direction": "increases risk" if value > 0 else "reduces risk"
      }
      for feature, value in ranked[:top_k]
    ]
