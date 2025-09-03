import mongoose from "mongoose";
import dotenv from "dotenv";
import Metadata from "../models/metadata.model.js";

dotenv.config();

const fields = [
  // Identity / Display-only (not ML features)
  {
    fieldKey: "studentId",
    displayName: "Student ID",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
  },
  {
    fieldKey: "studentName",
    displayName: "Student Name",
    type: "string",
    required: true,
    category: "identity",
    useInML: false,
  },
  {
    fieldKey: "rollNumber",
    displayName: "Roll Number",
    type: "string",
    required: false,
    category: "identity",
    useInML: false,
  },
  {
    fieldKey: "dateOfBirth",
    displayName: "Date of Birth",
    type: "date",
    required: false,
    category: "identity",
    useInML: false,
  },
  {
    fieldKey: "gender",
    displayName: "Gender",
    type: "string",
    required: false,
    category: "identity",
    useInML: false,
  },

  // Predictive / Risk + ML Features
  {
    fieldKey: "attendancePercentage",
    displayName: "Attendance %",
    type: "number",
    required: true,
    category: "attendance",
    useInML: true,
  },
  {
    fieldKey: "lateSubmissionCount",
    displayName: "Late Submissions",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
  },
  {
    fieldKey: "cgpa",
    displayName: "CGPA / Marks",
    type: "number",
    required: true,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "previousYearPerformance",
    displayName: "Previous Year Performance",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "mathScore",
    displayName: "Math Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "englishScore",
    displayName: "English Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "scienceScore",
    displayName: "Science Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "projectScore",
    displayName: "Project / Practical Score",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "totalMarks",
    displayName: "Total Marks",
    type: "number",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "feesPaid",
    displayName: "Fees Paid",
    type: "boolean",
    required: true,
    category: "financial",
    useInML: true,
  },
  {
    fieldKey: "libraryDues",
    displayName: "Library Dues",
    type: "number",
    required: false,
    category: "financial",
    useInML: true,
  },
  {
    fieldKey: "sportsScore",
    displayName: "Sports / Extra-Curricular",
    type: "number",
    required: false,
    category: "extracurricular",
    useInML: true,
  },
  {
    fieldKey: "behaviorScore",
    displayName: "Behavior / Discipline",
    type: "number",
    required: false,
    category: "behavior",
    useInML: true,
  },
  {
    fieldKey: "scholarshipEligibility",
    displayName: "Scholarship Eligibility",
    type: "boolean",
    required: false,
    category: "academic",
    useInML: true,
  },
  {
    fieldKey: "specialNeedsFlag",
    displayName: "Special Needs",
    type: "boolean",
    required: false,
    category: "identity",
    useInML: true,
  },
];

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
