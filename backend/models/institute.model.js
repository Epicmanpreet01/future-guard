import { Schema, model } from "mongoose";

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
      config: {
        type: Object,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  )
);

export default Institute;
