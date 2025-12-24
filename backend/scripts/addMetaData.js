import mongoose from "mongoose";
import dotenv from "dotenv";
import Metadata from "../models/metadata.model.js";

dotenv.config();

const fields = [
  // =========================
  // Identity / Display-only
  // =========================
  {
    fieldKey: "studentId",
    displayName: "Student ID",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
    synonyms: [
      "id",
      "student id",
      "student_id",
      "student no",
      "student number",
      "student_no",
      "enrollment id",
      "enrollment no",
      "enrollment number",
      "roll",
      "roll id",
      "roll no",
      "roll number",
      "roll_no",
      "registration id",
      "registration number",
    ],
  },
  {
    fieldKey: "studentName",
    displayName: "Student Name",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
    synonyms: [
      "name",
      "student name",
      "student_name",
      "full name",
      "full_name",
      "candidate name",
      "learner name",
    ],
  },
  {
    fieldKey: "dateOfBirth",
    displayName: "Date of Birth",
    type: "date",
    required: false,
    category: "identity",
    useInML: false,
    synonyms: [
      "dob",
      "date of birth",
      "birthdate",
      "birth date",
      "date_of_birth",
    ],
  },
  {
    fieldKey: "gender",
    displayName: "Gender",
    type: "string",
    required: false,
    category: "identity",
    useInML: false,
    synonyms: ["gender", "sex", "male/female", "m/f", "student gender"],
  },

  // =========================
  // Predictive / ML Features
  // =========================
  {
    fieldKey: "age",
    displayName: "Age",
    type: "number",
    required: false,
    category: "identity",
    useInML: true,
    synonyms: [
      "age",
      "student age",
      "student_age",
      "years",
      "yrs",
      "current age",
    ],
  },
  {
    fieldKey: "attendancePercentage",
    displayName: "Attendance %",
    type: "number",
    required: true,
    category: "attendance",
    useInML: true,
    synonyms: [
      "attendance",
      "attendance %",
      "attendance%",
      "attendance percentage",
      "attendance percent",
      "att %",
      "att%",
      "presence",
    ],
  },
  {
    fieldKey: "lateSubmissionCount",
    displayName: "Late Submissions",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
    synonyms: [
      "late submissions",
      "late submission count",
      "late work",
      "delayed submissions",
      "missed deadlines",
    ],
  },
  {
    fieldKey: "cgpa",
    displayName: "CGPA / Marks",
    type: "number",
    required: true,
    category: "academic",
    useInML: true,
    synonyms: [
      "cgpa",
      "gpa",
      "grade",
      "grades",
      "marks",
      "score",
      "percentage",
      "average marks",
      "overall grade",
    ],
  },
  {
    fieldKey: "previousYearPerformance",
    displayName: "Previous Year Performance",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: [
      "previous year performance",
      "last year performance",
      "previous marks",
      "last year marks",
      "prior year score",
    ],
  },
  {
    fieldKey: "mathScore",
    displayName: "Math Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: [
      "math score",
      "maths score",
      "mathematics",
      "math marks",
      "maths marks",
    ],
  },
  {
    fieldKey: "englishScore",
    displayName: "English Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["english score", "english marks", "language score"],
  },
  {
    fieldKey: "scienceScore",
    displayName: "Science Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["science score", "science marks", "physics chemistry biology"],
  },
  {
    fieldKey: "projectScore",
    displayName: "Project / Practical Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: [
      "project score",
      "project marks",
      "practical score",
      "practical marks",
      "lab score",
      "lab marks",
    ],
  },
  {
    fieldKey: "totalMarks",
    displayName: "Total Marks",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["total marks", "overall marks", "marks obtained", "final score"],
  },
  {
    fieldKey: "feesPaid",
    displayName: "Fees Paid",
    type: "boolean",
    required: true,
    category: "financial",
    useInML: true,
    synonyms: [
      "fees paid",
      "fee paid",
      "fees",
      "fee status",
      "payment status",
      "paid",
      "paid?",
      "is paid",
      "fees cleared",
    ],
  },
  {
    fieldKey: "libraryDues",
    displayName: "Library Dues",
    type: "number",
    required: false,
    category: "financial",
    useInML: true,
    synonyms: ["library dues", "library fine", "book dues", "library pending"],
  },
  {
    fieldKey: "sportsScore",
    displayName: "Sports / Extra-Curricular",
    type: "number",
    required: false,
    category: "extracurricular",
    useInML: true,
    synonyms: [
      "sports score",
      "sports marks",
      "extracurricular",
      "extra curricular",
      "activities score",
    ],
  },
  {
    fieldKey: "behaviorScore",
    displayName: "Behavior / Discipline",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
    synonyms: [
      "behavior score",
      "behaviour score",
      "discipline",
      "conduct",
      "character",
    ],
  },
  {
    fieldKey: "scholarshipEligibility",
    displayName: "Scholarship Eligibility",
    type: "boolean",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: [
      "scholarship",
      "scholarship eligibility",
      "eligible for scholarship",
      "scholarship status",
    ],
  },
  {
    fieldKey: "specialNeedsFlag",
    displayName: "Special Needs",
    type: "boolean",
    required: false,
    category: "identity",
    useInML: true,
    synonyms: [
      "special needs",
      "special assistance",
      "disability",
      "differently abled",
      "handicap",
    ],
  },
];

function getFeatures() {
  return fields.filter((field) => field.useInML).map((field) => field.fieldKey);
}

async function seedMetadata() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Metadata.deleteMany({});
    console.log("Cleared existing Metadata");

    await Metadata.insertMany(fields);
    console.log("Inserted metadata fields successfully");

    process.exit(0);
  } catch (err) {
    console.error("Error seeding metadata:", err);
    process.exit(1);
  }
}

seedMetadata();
