# core/preprocessing.py

import numpy as np
import pandas as pd
import joblib
from typing import List, Dict

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
  "notEnrolled",
]

MODEL_FEATURE_ORDER = CATEGORICAL_FEATURES + CONTINUOUS_FEATURES

SCALER_PATH = "models/scalar/scaler.joblib"


def _safe_float(value, default=0.0):
  try:
    return float(value)
  except Exception:
    return default


def _safe_int(value, default=0):
  try:
    return int(value)
  except Exception:
    return default



def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
  # Ensure numeric
  df["ageAtEnrollment"] = df["ageAtEnrollment"].apply(_safe_int)
  df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].apply(_safe_float)
  df["totalCreditsApproved"] = df["totalCreditsApproved"].apply(_safe_float)
  df["cgpa"] = df["cgpa"].apply(_safe_float)

  # notEnrolled
  df["notEnrolled"] = (df["totalCreditsEnrolled"] == 0).astype(int)

  # Clip to training constraints
  df["cgpa"] = df["cgpa"].clip(0, 10)
  df["totalCreditsEnrolled"] = df["totalCreditsEnrolled"].clip(0, 200)
  df["totalCreditsApproved"] = df["totalCreditsApproved"].clip(0, 300)

  return df


def scale_continuous(df: pd.DataFrame) -> pd.DataFrame:
  scaler = joblib.load(SCALER_PATH)
  df[CONTINUOUS_FEATURES] = scaler.transform(df[CONTINUOUS_FEATURES])
  return df



def preprocess(rows: List[Dict]) -> pd.DataFrame:

  df = pd.DataFrame(rows)

  for col in MODEL_FEATURE_ORDER:
    if col not in df.columns:
      df[col] = 0

  df = engineer_features(df)

  df = scale_continuous(df)

  df = df[MODEL_FEATURE_ORDER]

  return df
