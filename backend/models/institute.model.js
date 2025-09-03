import { Schema, model } from "mongoose";

const configSchema = new Schema({
  columns: [
    {
      csvHeader: {
        type: String,
        required: true,
      },
      fieldKey: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["string", "number", "boolean", "date"],
        required: true,
      },
      required: {
        type: Boolean,
        default: false,
      },
      transfomation: [
        {
          type: String,
        },
      ],
    },
  ],
  locked: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Institute = model(
  "Institute",
  new Schema(
    {
      instituteName: {
        type: String,
        required: true,
        unique: true,
      },
      adminId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      config: configSchema,
    },
    {
      timestamps: true,
    }
  )
);

export default Institute;
