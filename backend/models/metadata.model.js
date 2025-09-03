import { Schema, model } from "mongoose";

const Metadata = model(
  "Metadata",
  new Schema({
    fieldKey: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "date"],
      required: true,
    },
    required: { type: Boolean, default: false },
    category: { type: String },
    useInML: { type: Boolean, default: true },
  })
);

export default Metadata;
