import os
import requests
import joblib
from typing import Any, Optional

from core.config import MODEL_BASE_URL, PREDICTOR_PATH, SCALER_PATH, MODEL_FILENAME, SCALER_FILENAME
from core.exceptions import ModelNotFoundError


class ModelLoader:
  def __init__(self) -> None:
    self._model: Optional[Any] = None
    self._scaler: Optional[Any] = None

  @staticmethod
  def _ensure_dir(path: str) -> None:
    directory = os.path.dirname(path)
    if directory:
      os.makedirs(directory, exist_ok=True)

  def _download_file(self, url: str, dest: str) -> None:
    if os.path.exists(dest):
      return

    if not MODEL_BASE_URL:
      raise ModelNotFoundError("MODEL_BASE_URL is not configured")

    self._ensure_dir(dest)

    response = requests.get(url, timeout=60)
    response.raise_for_status()

    with open(dest, "wb") as file:
      file.write(response.content)

  def load_predictor(self) -> Any:
    if self._model is None:
      model_url = f"{MODEL_BASE_URL}/{MODEL_FILENAME}"
      self._download_file(model_url, PREDICTOR_PATH)
      self._model = joblib.load(PREDICTOR_PATH)

    return self._model

  def load_scaler(self) -> Any:
    if self._scaler is None:
      scaler_url = f"{MODEL_BASE_URL}/{SCALER_FILENAME}"
      self._download_file(scaler_url, SCALER_PATH)
      self._scaler = joblib.load(SCALER_PATH)

    return self._scaler
