import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: { type: String, required: true },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "mentor"],
      required: true,
    },
    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
    },
    department: { type: String, trim: true },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.hashedPassword;
    return ret;
  },
});

const User = model("User", UserSchema);
export default User;
