import { Schema, model } from "mongoose";

const Student = model(
  "Student",
  new Schema({
    rollId: {
      type: String,
      required: true,
      unique: true,
    },
    institueId: {
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
    success: {
      type: Boolean,
    },
  })
);

export default Student;
