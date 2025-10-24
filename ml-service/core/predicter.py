import joblib
import os
import xgboost as xgb
import pandas as pd
import numpy as np

def load_model(model_path: str = 'ml-service/models') -> xgb.XGBClassifier:
  no_of_models: int = len(os.listdir(model_path))
  model: xgb.XGBClassifier = joblib.load(f'{model_path}/model_{no_of_models}.pth')
  return model

def predict(student_batch: pd.DataFrame) -> np.ndarray:
  model: xgb.XGBClassifier = load_model()
  probabilities: np.ndarray = model.predict_proba(student_batch)
  return probabilities[:, 1]