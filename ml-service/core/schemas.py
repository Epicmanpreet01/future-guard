from pydantic import BaseModel
from typing import List, Dict, Any

class Student(BaseModel):
  id: str
  features: Dict[str, Any]

class StudentBatch(BaseModel):
  students: List[Student]

class StudentResult(BaseModel):
  id: str
  risk_score: float
  risk_label: str
  explanation: Dict[str, Any]
  recommendation: str

class PredictionResponse(BaseModel):
  results: List[StudentResult]
