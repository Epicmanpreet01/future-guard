from typing import List,Dict, Any
from core.config import SHAP_ACTION_MAP


class RecommendationEngine:
  def recommend(self, risk_score: float, final_risk: str, features: Dict[str, Any], shap_summary: List[Dict]) -> str:
    actions = []

    attendance = float(features.get("attendancePercentage", 100) or 100)
    cgpa = float(features.get("cgpa", 10) or 10)
    fees_paid = features.get("feesPaid") in [True, 1, "true", "True"]

    for item in shap_summary:
      if item["impact"] > 0:
        action = SHAP_ACTION_MAP.get(item["feature"])
        if action and action not in actions:
          actions.append(action)

    if attendance < 60:
      actions.append("Improve class attendance immediately")

    if cgpa < 6:
      actions.append("Schedule academic counseling sessions")

    if not fees_paid:
      actions.append("Resolve pending fee payments")

    if final_risk == "high":
      actions.append("Assign mentor follow-up and weekly monitoring")
    elif final_risk == "medium":
      actions.append("Monthly academic check-ins recommended")

    if not actions:
      return "Student is performing well. Encourage continued consistency."

    actions = list(dict.fromkeys(actions))

    return "; ".join(actions)
