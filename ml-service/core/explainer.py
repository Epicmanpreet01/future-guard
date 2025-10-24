def explain(students):
  explanations = []
  for student in students:
    explanations.append({
      "id": student.id,
      "feature_importance": {
        "attendance": 0.4,
        "gpa": 0.35,
        "assignments": 0.25
      }
    })
  return explanations
