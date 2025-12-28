# core/preprocessing.py

import numpy as np
import pandas as pd
from typing import List, Dict
from core.model_loader import load_scaler as _load_remote_scaler

CONTINUOUS_FEATURES = [
  "ageAtEnrollment",
  "totalCreditsEnrolled",
  "totalCreditsApproved",
  "cgpa",
]

CATEGORICAL_FEATURES = [
  "studyMode",
  "previousEducation",
  "displacedStatus",
  "specialNeeds",
  "gender",
  "scholarShipStatus",
  "international",
  "parentEducation",
  "parentEmployentStatus",
  "feesPaid",
]

MODEL_FEATURE_ORDER = CATEGORICAL_FEATURES + CONTINUOUS_FEATURES

SCALER_PATH = "models/scalar/scaler.joblib"

_scaler = None


def load_scaler():
    global _scaler
    if _scaler is None:
        _scaler = _load_remote_scaler()
    return _scaler



def _safe_float(v, default=0.0):
  try:
    return float(v)
  except Exception:
    return default


def _safe_int(v, default=0):
  try:
    return int(v)
  except Exception:
    return default


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
  df["ageAtEnrollment"] = df["ageAtEnrollment"].apply(_safe_int)
  df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].apply(_safe_float)
  df["totalCreditsApproved"] = df["totalCreditsApproved"].apply(_safe_float)
  df["cgpa"] = df["cgpa"].apply(_safe_float)

  df["notEnrolled"] = (df["totalCreditsEnrolled"] == 0).astype(int)

  df["cgpa"] = df["cgpa"].clip(0, 10)
  df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].clip(0, 200)
  df["totalCreditsApproved"] = df["totalCreditsApproved"].clip(0, 300)

  return df


def scale_continuous(df: pd.DataFrame) -> pd.DataFrame:
  scaler = load_scaler()
  df[CONTINUOUS_FEATURES] = scaler.transform(df[CONTINUOUS_FEATURES])
  return df


def preprocess(rows: List[Dict]) -> pd.DataFrame:
  df = pd.DataFrame(rows)

  missing = set(MODEL_FEATURE_ORDER) - set(df.columns)
  if missing:
    raise ValueError(
      f"Missing required ML features: {sorted(missing)}"
    )

  df = engineer_features(df)
  df = scale_continuous(df)

  return df[MODEL_FEATURE_ORDER]
