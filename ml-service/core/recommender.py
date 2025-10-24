def recommend(students):
  recs = []
  for student in students:
    recs.append({
      "id": student.id,
      "recommendation": "Increase study hours and attend mentoring sessions."
  })
  return recs
