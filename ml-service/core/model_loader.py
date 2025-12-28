import os
import requests
import joblib

BASE_DIR = "models"
PREDICTOR_PATH = os.path.join(BASE_DIR, "predictor", "model_3.pth")
SCALER_PATH = os.path.join(BASE_DIR, "scalar", "scaler.joblib")

MODEL_BASE_URL = os.getenv("MODEL_BASE_URL")


def _ensure_dir(path: str):
  os.makedirs(os.path.dirname(path), exist_ok=True)


def _download_file(url: str, dest: str):
  if os.path.exists(dest):
    return

  if not MODEL_BASE_URL:
    raise RuntimeError("MODEL_BASE_URL environment variable not set")

  _ensure_dir(dest)

  resp = requests.get(url, timeout=60)
  resp.raise_for_status()

  with open(dest, "wb") as f:
    f.write(resp.content)



_model = None
_scaler = None


def load_predictor():
  global _model

  if _model is None:
    _download_file(
      f"{MODEL_BASE_URL}/model_3.pth",
      PREDICTOR_PATH,
    )
    _model = joblib.load(PREDICTOR_PATH)

  return _model


def load_scaler():
  global _scaler

  if _scaler is None:
    _download_file(
      f"{MODEL_BASE_URL}/scaler.joblib",
      SCALER_PATH,
    )
    _scaler = joblib.load(SCALER_PATH)

  return _scaler
