import { Schema, model } from "mongoose";

const AggregationSchema = new Schema({
  risk: {
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
  },
  success: { type: Number, default: 0 },
});

const BaseUserSchema = new Schema(
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
    aggregations: AggregationSchema,
  },
  { timestamps: true, discriminatorKey: "__t" }
);

BaseUserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.hashedPassword;
    return ret;
  },
});

const User = model("User", BaseUserSchema);

const SuperAdminSchema = new Schema({
  aggregations: {
    institute: {
      active: { type: Number, default: 0 },
      inactive: { type: Number, default: 0 },
    },
  },
});

const AdminSchema = new Schema({
  aggregations: {
    mentor: {
      active: { type: Number, default: 0 },
      inactive: { type: Number, default: 0 },
    },
  },
});

const SuperAdmin = User.discriminator("superAdmin", SuperAdminSchema);

const Admin = User.discriminator("admin", AdminSchema);

const Mentor = User.discriminator("mentor", new Schema({}));

export { User, SuperAdmin, Admin, Mentor };
