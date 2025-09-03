import mongoose from "mongoose";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";

// super admin
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("-hashedPassword")
      .populate("instituteId");

    return res.status(200).json({
      success: true,
      message: "Fetched all admins",
      data: admins,
    });
  } catch (error) {
    console.error(`Error while fetching admins: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getAdminById = async (req, res) => {
  const { adminId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return res.status(400).json({ success: false, error: "Invalid admin ID" });
  }

  try {
    const admin = await User.findById(adminId)
      .select("-hashedPassword")
      .populate("instituteId");

    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: admin,
    });
  } catch (error) {
    console.error(`Error while fetching admin: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const deactivateActivateAdmin = async (req, res) => {
  const { adminId } = req.params;
  const { status } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(adminId) ||
    typeof status !== "boolean"
  ) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  try {
    const admin = await User.findById(adminId).select("-hashedPassword");
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    admin.activeStatus = status;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin status updated",
      data: { adminId, status },
    });
  } catch (error) {
    console.error(`Error while updating admin status: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

// admin
export const getMentors = async (req, res) => {
  const { user: currUser } = req;

  try {
    const mentors = await User.find({
      role: "mentor",
      instituteId: currUser.instituteId,
    }).select("-hashedPassword");

    return res.status(200).json({
      success: true,
      message: "Mentors fetched successfully",
      data: mentors,
    });
  } catch (error) {
    console.error(`Error while fetching mentors: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getMentorById = async (req, res) => {
  const { user: currUser } = req;
  const { mentorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({ success: false, error: "Invalid mentor ID" });
  }

  try {
    const mentor = await User.findById(mentorId).select("-hashedPassword");
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, error: "Mentor not found" });
    }

    if (!mentor.instituteId.equals(currUser.instituteId)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: Not enough privileges" });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor fetched successfully",
      data: mentor,
    });
  } catch (error) {
    console.error(`Error while fetching mentor: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const deactivateActivateMentor = async (req, res) => {
  const { user: currUser } = req;
  const { mentorId } = req.params;
  const { status } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(mentorId) ||
    typeof status !== "boolean"
  ) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  try {
    const mentor = await User.findById(mentorId).select("-hashedPassword");
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, error: "Mentor not found" });
    }

    if (!mentor.instituteId.equals(currUser.instituteId)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: Not enough privileges" });
    }

    mentor.activeStatus = status;
    await mentor.save();

    return res.status(200).json({
      success: true,
      message: "Mentor status updated successfully",
      data: { mentorId, status },
    });
  } catch (error) {
    console.error(`Error while updating mentor status: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const removeMentor = async (req, res) => {
  const { user: currUser } = req;
  const { mentorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({ success: false, error: "Invalid mentor ID" });
  }

  try {
    const mentor = await User.findOneAndDelete({
      _id: mentorId,
      instituteId: currUser.instituteId,
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: "Mentor not found or insufficient permissions",
      });
    }

    await Student.deleteMany({ mentorId });

    return res.status(200).json({
      success: true,
      message: "Mentor removed successfully",
      data: mentorId,
    });
  } catch (error) {
    console.error(`Error while removing mentor: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
