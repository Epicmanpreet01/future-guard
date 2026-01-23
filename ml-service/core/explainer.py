from typing import Dict, Any, List


class Explainer:
  def explain(
    self,
    features: Dict[str, Any],
    rule_result: Dict[str, Any],
    ml_risk: str,
    risk_score: float,
    shap_summary: List[Dict]
  ) -> Dict[str, Any]:

    reasons: List[str] = []

    reasons.extend(rule_result.get("reasons", []))

    attendance = float(features.get("attendancePercentage", 100) or 100)
    cgpa = float(features.get("cgpa", 10) or 10)
    fees_paid = features.get("feesPaid") in [True, 1, "true", "True"]

    if attendance < 75:
      reasons.append(f"Attendance is low ({attendance}%)")

    if cgpa < 6:
      reasons.append(f"CGPA is below average ({cgpa})")

    if not fees_paid:
      reasons.append("Outstanding fee payments")

    if not reasons:
      reasons.append("No major risk factors detected")

    top_factors = [
      f"{item['feature']} {item['direction']}"
      for item in shap_summary
      if item["impact"] > 0
    ]

    return {
      "ml_risk": ml_risk,
      "risk_score": round(risk_score, 4),
      "rule_risk": rule_result["risk"],
      "rule_reasons": rule_result["reasons"],
      "top_ml_factors": shap_summary,
      "combined_explanation": reasons + top_factors,
    }