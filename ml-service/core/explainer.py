def explain(features: dict, rule_result: dict, ml_risk: str, risk_score: float):
  reasons = []

  # Rule-based reasons (already validated)
  reasons.extend(rule_result.get("reasons", []))

  # Feature-driven explanations
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

  return {
    "ml_risk": ml_risk,
    "risk_score": round(risk_score, 4),
    "rule_risk": rule_result["risk"],
    "rule_reasons": rule_result["reasons"],
    "combined_explanation": reasons,
  }
