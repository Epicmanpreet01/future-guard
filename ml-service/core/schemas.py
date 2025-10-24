from pydantic import BaseModel
from typing import List, Dict, Any

class Student(BaseModel):
  id: str
  features: Dict[str, Any]  # e.g., {"attendance": 0.85, "gpa": 3.2}

class StudentBatch(BaseModel):
  students: List[Student]

class PredictionResponse(BaseModel):
  predictions: List[Dict[str, Any]]  # [{"id": "...", "risk": "High"}]

class ExplanationResponse(BaseModel):
  explanations: List[Dict[str, Any]]  # [{"id": "...", "feature_importance": {...}}]

class RecommendationResponse(BaseModel):
  recommendations: List[Dict[str, Any]]  # [{"id": "...", "recommendation": "..."}]
