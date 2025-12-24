// utils/mlFeatureMapper.js

export function mapToMLFeatures(row) {
  // ----- Continuous -----
  const ageAtEnrollment = Number(row.age ?? 0);

  const cgpa = Number(row.cgpa ?? 0);

  const attendance = Number(row.attendancePercentage ?? 0);
  const totalMarks = Number(row.totalMarks ?? 0);

  // approximate enrollment strength
  const totalCreditsEnrolled = Math.round(
    (attendance / 100) * 60 + (totalMarks / 100) * 40
  );

  // approximate approval strength
  const totalCreditsApproved =
    cgpa >= 4 ? Math.round(totalCreditsEnrolled * (cgpa / 10)) : 0;

  // ----- Categorical / binary -----
  return {
    // categorical
    studyMode: 0, // unknown → neutral
    previousEducation: Number(row.previousYearPerformance ?? 0),
    displacedStatus: Number(row.specialNeedsFlag ?? 0),
    specialNeeds: Number(row.specialNeedsFlag ?? 0),
    gender: 0, // unknown
    scholarShipStatus: Number(row.scholarshipEligibility ?? 0),
    international: 0,
    parentEducation: Number(row.previousYearPerformance ?? 0),
    parentEmployentStatus: 0,
    feesPaid: row.feesPaid ? 1 : 0,

    // continuous
    ageAtEnrollment,
    totalCreditsEnrolled,
    totalCreditsApproved,
    cgpa,
  };
}
