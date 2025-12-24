// models/student.model.js
import { Schema, model } from "mongoose";

const Student = model(
  "Student",
  new Schema(
    {
      rollId: { type: String, required: true },
      instituteId: {
        type: Schema.Types.ObjectId,
        ref: "Institute",
        required: true,
      },
      mentorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      riskValue: {
        type: String,
        enum: ["high", "medium", "low"],
        required: true,
      },
      success: { type: Boolean },

      standardizedInput: { type: Object },
      metadataVersion: { type: Number, default: 1 },
    },
    { timestamps: true }
  )
);

export default Student;
