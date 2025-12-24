def rule_based_risk(features: dict) -> dict:

  attendance = float(features.get("attendancePercentage", 100) or 100)
  cgpa = float(features.get("cgpa", 10) or 10)
  fees_paid = features.get("feesPaid") in [True, 1, "true", "True"]

  reasons = []

  # HIGH RISK RULES
  if attendance < 50:
    reasons.append("Attendance below 50%")
  if cgpa < 3:
    reasons.append("CGPA below 3")

  if reasons:
    return {"risk": "high", "reasons": reasons}

  # MEDIUM RISK RULES
  if not fees_paid:
    reasons.append("Fees pending")
  if attendance < 60:
    reasons.append("Attendance below 60%")
  if cgpa < 6:
    reasons.append("CGPA below 6")

  if reasons:
    return {"risk": "medium", "reasons": reasons}

  return {"risk": "low", "reasons": []}
