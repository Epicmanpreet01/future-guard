def rule_based_risk(features: dict) -> dict:

  attendance = float(features.get("attendancePercentage", 100) or 100)
  cgpa = float(features.get("cgpa", 10) or 10)
  fees_paid = features.get("feesPaid") in [True, 1, "true", "True"]

  reasons = []

  # HIGH RISK RULES
  if attendance < 60:
    reasons.append("Attendance below 60%")
  if cgpa < 4:
    reasons.append("CGPA below 4")

  if reasons:
    return {"risk": "high", "reasons": reasons}

  # MEDIUM RISK RULES
  if not fees_paid:
    reasons.append("Fees pending")
  if attendance < 75:
    reasons.append("Attendance below 75%")
  if cgpa < 6:
    reasons.append("CGPA below 6")

  if reasons:
    return {"risk": "medium", "reasons": reasons}

  return {"risk": "low", "reasons": []}
