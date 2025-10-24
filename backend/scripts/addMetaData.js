import mongoose from "mongoose";
import dotenv from "dotenv";
import Metadata from "../models/metadata.model.js";

dotenv.config();

const fields = [
  // Identity / Display-only
  {
    fieldKey: "studentId",
    displayName: "Student ID",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
    synonyms: ["id", "student_no", "student number", "enrollment id"],
  },
  {
    fieldKey: "studentName",
    displayName: "Student Name",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
    synonyms: ["name", "full name"],
  },
  {
    fieldKey: "rollNumber",
    displayName: "Roll Number",
    type: "string",
    required: false,
    category: "identity",
    useInML: false,
    synonyms: ["roll id", "roll_no", "roll no", "roll"],
  },
  {
    fieldKey: "dateOfBirth",
    displayName: "Date of Birth",
    type: "date",
    required: false,
    category: "identity",
    useInML: false,
    synonyms: ["dob", "birthdate", "birth date"],
  },
  {
    fieldKey: "gender",
    displayName: "Gender",
    type: "string",
    required: false,
    category: "identity",
    useInML: false,
    synonyms: ["sex", "male/female", "m/f"],
  },

  // Predictive / Risk + ML Features
  {
    fieldKey: "age",
    displayName: "Age",
    type: "number",
    required: true,
    category: "identity",
    useInML: true,
    synonyms: ["age", "studentAge", "years", "yrs", "currentAge"],
  },
  {
    fieldKey: "attendancePercentage",
    displayName: "Attendance %",
    type: "number",
    required: true,
    category: "attendance",
    useInML: true,
    synonyms: ["attendance", "att%", "attendance percent"],
  },
  {
    fieldKey: "lateSubmissionCount",
    displayName: "Late Submissions",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
    synonyms: ["late work", "delayed submissions"],
  },
  {
    fieldKey: "cgpa",
    displayName: "CGPA / Marks",
    type: "number",
    required: true,
    category: "academic",
    useInML: true,
    synonyms: ["grade", "gpa", "marks", "percentage"],
  },
  {
    fieldKey: "previousYearPerformance",
    displayName: "Previous Year Performance",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["last year marks", "previous marks"],
  },
  {
    fieldKey: "mathScore",
    displayName: "Math Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["maths marks", "mathematics"],
  },
  {
    fieldKey: "englishScore",
    displayName: "English Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["english marks"],
  },
  {
    fieldKey: "scienceScore",
    displayName: "Science Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["science marks"],
  },
  {
    fieldKey: "projectScore",
    displayName: "Project / Practical Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["practical marks", "lab score"],
  },
  {
    fieldKey: "totalMarks",
    displayName: "Total Marks",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["marks obtained", "overall marks"],
  },
  {
    fieldKey: "feesPaid",
    displayName: "Fees Paid",
    type: "boolean",
    required: true,
    category: "financial",
    useInML: true,
    synonyms: ["fees", "payment status", "paid", "fee status"],
  },
  {
    fieldKey: "libraryDues",
    displayName: "Library Dues",
    type: "number",
    required: false,
    category: "financial",
    useInML: true,
    synonyms: ["library fine", "book dues"],
  },
  {
    fieldKey: "sportsScore",
    displayName: "Sports / Extra-Curricular",
    type: "number",
    required: false,
    category: "extracurricular",
    useInML: true,
    synonyms: ["sports marks", "extracurricular"],
  },
  {
    fieldKey: "behaviorScore",
    displayName: "Behavior / Discipline",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
    synonyms: ["discipline", "conduct", "character"],
  },
  {
    fieldKey: "scholarshipEligibility",
    displayName: "Scholarship Eligibility",
    type: "boolean",
    required: false,
    category: "academic",
    useInML: true,
    synonyms: ["scholarship", "eligible for scholarship"],
  },
  {
    fieldKey: "specialNeedsFlag",
    displayName: "Special Needs",
    type: "boolean",
    required: false,
    category: "identity",
    useInML: true,
    synonyms: ["disability", "special assistance"],
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
