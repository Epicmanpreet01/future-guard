import os

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

BASE_DIR = "models"
PREDICTOR_PATH = os.path.join(BASE_DIR, "predictor", "model_3.pth")
SCALER_PATH = os.path.join(BASE_DIR, "scalar", "scaler.joblib")

MODEL_BASE_URL = os.getenv("MODEL_BASE_URL")

MODEL_FILENAME = "model_3.pth"
SCALER_FILENAME = "scaler.joblib"