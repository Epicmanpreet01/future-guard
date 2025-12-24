def recommend(risk_score: float) -> str:
  if risk_score > 0.7:
    return "Increase study hours and attend mentoring sessions."
  elif risk_score > 0.4:
    return "Maintain consistency and seek academic guidance."
  else:
    return "Keep up the good work."