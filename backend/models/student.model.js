// models/student.model.js
import { Schema, model } from "mongoose";

const Student = model(
  "Student",
  new Schema(
    {
      rollId: { type: String, required: true },
      instituteId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
      },

      // Current state
      riskValue: {
        type: String,
        enum: ["high", "medium", "low"],
        required: true,
      },

      // For outcome tracking
      previousRiskValue: {
        type: String,
        enum: ["high", "medium", "low"],
      },

      // Derived flag
      success: { type: Boolean, default: false },

      lastUpdatedByMentor: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
  )
);

// Prevent duplicates
Student.schema.index({ rollId: 1, instituteId: 1 }, { unique: true });

export default Student;
