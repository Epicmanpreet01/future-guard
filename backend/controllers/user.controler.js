import mongoose from "mongoose";
import { User, Mentor, Admin, SuperAdmin } from "../models/user.model.js";
import Student from "../models/student.model.js";

// super admin
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "admin" })
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
    const admin = await Admin.findById(adminId)
      .select("-hashedPassword")
      .populate("instituteId");

    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    if (admin.role === "superAdmin")
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: Insufficient privilages" });

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
  const session = await mongoose.startSession();
  if (
    !mongoose.Types.ObjectId.isValid(adminId) ||
    typeof status !== "boolean"
  ) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  try {
    session.startTransaction();
    const admin = await Admin.findById(adminId)
      .select("-hashedPassword")
      .session(session);
    if (!admin) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    if (admin.activeStatus === status)
      return res.status(200).json({
        success: true,
        message: "active status already same as input",
        data: { adminId, status },
      });

    admin.activeStatus = status;
    await admin.save({ session });

    await SuperAdmin.findByIdAndUpdate(
      req.user.userId,
      {
        $inc: status
          ? {
              "aggregations.institute.active": 1,
              "aggregations.institute.inactive": -1,
            }
          : {
              "aggregations.institute.active": -1,
              "aggregations.institute.inactive": 1,
            },
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Admin status updated",
      data: { adminId, status },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error while updating admin status: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  } finally {
    await session.endSession();
  }
};

// admin
export const getMentors = async (req, res) => {
  const { user: currUser } = req;

  try {
    const mentors = await Mentor.find({
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
    const mentor = await Mentor.findById(mentorId).select("-hashedPassword");
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
  const session = await mongoose.startSession();
  if (
    !mongoose.Types.ObjectId.isValid(mentorId) ||
    typeof status !== "boolean"
  ) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  try {
    session.startTransaction();
    const mentor = await Mentor.findOne({
      _id: mentorId,
      instituteId: currUser.instituteId,
    })
      .select("-hashedPassword")
      .session(session);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: "Mentor not found or insufficient permissions",
      });
    }

    if (mentor.activeStatus === status)
      return res.status(200).json({
        success: true,
        message: "active status already same as input",
        data: { mentorId, status },
      });

    mentor.activeStatus = status;
    await mentor.save({ session });

    await Admin.findByIdAndUpdate(
      currUser.userId,
      {
        $inc: status
          ? {
              "aggregations.mentor.active": 1,
              "aggregations.mentor.inactive": -1,
            }
          : {
              "aggregations.mentor.active": -1,
              "aggregations.mentor.inactive": 1,
            },
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Mentor status updated successfully",
      data: { mentorId, status },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error while updating mentor status: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  } finally {
    await session.endSession();
  }
};

export const removeMentor = async (req, res) => {
  const { user: currUser } = req;
  const { mentorId } = req.params;
  const session = await mongoose.startSession();

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).json({ success: false, error: "Invalid mentor ID" });
  }

  try {
    session.startTransaction();
    const mentor = await Mentor.findOneAndDelete(
      {
        _id: mentorId,
        instituteId: currUser.instituteId,
      },
      { session }
    );

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: "Mentor not found or insufficient permissions",
      });
    }

    if (mentor.aggregations) {
      await User.updateMany(
        {
          $or: [
            { instituteId: currUser.instituteId, role: "admin" },
            { role: "superAdmin" },
          ],
        },
        {
          $inc: {
            "aggregations.risk.high": -mentor.aggregations.risk.high,
            "aggregations.risk.medium": -mentor.aggregations.risk.medium,
            "aggregations.risk.low": -mentor.aggregations.risk.low,
            "aggregations.success": -mentor.aggregations.success,
          },
        },
        { session }
      );
    }

    await Admin.findByIdAndUpdate(
      currUser.userId,
      {
        $inc: mentor.activeStatus
          ? { "aggregations.mentor.active": -1 }
          : { "aggregations.mentor.inactive": -1 },
      },
      { session }
    );

    await Student.deleteMany({ mentorId }, { session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Mentor removed successfully",
      data: mentorId,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error while removing mentor: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  } finally {
    await session.endSession();
  }
};
