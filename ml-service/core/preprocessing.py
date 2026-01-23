import pandas as pd
from typing import List, Dict, Any, Optional

from core.config import CONTINUOUS_FEATURES, MODEL_FEATURE_ORDER
from core.model_loader import ModelLoader


class Preprocessor:
  def __init__(self, model_loader: Optional[ModelLoader] = None):
    self.model_loader = model_loader or ModelLoader()
    self._scaler = None

  @staticmethod
  def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
      return float(value)
    except Exception:
      return default

  @staticmethod
  def _safe_int(value: Any, default: int = 0) -> int:
    try:
      return int(value)
    except Exception:
      return default

  def load_scaler(self):
    if self._scaler is None:
      self._scaler = self.model_loader.load_scaler()
    return self._scaler

  def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
    df["ageAtEnrollment"] = df["ageAtEnrollment"].apply(self._safe_int)
    df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].apply(self._safe_float)
    df["totalCreditsApproved"] = df["totalCreditsApproved"].apply(self._safe_float)
    df["cgpa"] = df["cgpa"].apply(self._safe_float)

    df["notEnrolled"] = (df["totalCreditsEnrolled"] == 0).astype(int)

    df["cgpa"] = df["cgpa"].clip(0, 10)
    df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].clip(0, 200)
    df["totalCreditsApproved"] = df["totalCreditsApproved"].clip(0, 300)

    return df

  def scale_continuous(self, df: pd.DataFrame) -> pd.DataFrame:
    scaler = self.load_scaler()
    df[CONTINUOUS_FEATURES] = scaler.transform(df[CONTINUOUS_FEATURES])
    return df

  def preprocess(self, rows: List[Dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)

    missing = set(MODEL_FEATURE_ORDER) - set(df.columns)
    if missing:
      raise ValueError(
        f"Missing required ML features: {sorted(missing)}"
      )

    df = self.engineer_features(df)
    df = self.scale_continuous(df)

    return df[MODEL_FEATURE_ORDER]
