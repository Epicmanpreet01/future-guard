import Institute from "../models/institute.model.js";
import { SuperAdmin, User } from "../models/user.model.js";
import mongoose from "mongoose";
import Student from "../models/student.model.js";

export const getInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find().populate(
      "adminId",
      "-hashedPassword"
    );

    return res.status(200).json({
      success: true,
      message: "fetched all institutes",
      data: institutes,
    });
  } catch (error) {
    console.error(`Error occured while fetching institutes: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getInstituteById = async (req, res) => {
  const { instituteId } = req.params;

  if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId))
    return res.status(400).json({ success: false, error: "Invalid id" });

  try {
    const institutes = await Institute.find({ _id: instituteId }).populate(
      "adminId",
      "-hashedPassword"
    );

    return res.status(200).json({
      success: true,
      message: "Fetched instute successfully",
      data: institutes,
    });
  } catch (error) {
    console.error(`Error occured while fetching institute: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const removeInstitute = async (req, res) => {
  const { instituteId } = req.params;
  const { userId } = req.user;
  const session = await mongoose.startSession();

  if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
    return res.status(401).json({ success: false, error: "Invalid id" });
  }

  try {
    session.startTransaction();

    const deletedInstitute = await Institute.findById(instituteId).populate(
      "adminId",
      "-hashedPassword"
    );

    if (!deletedInstitute) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, error: "Institute not found" });
    }

    const admin = deletedInstitute.adminId;

    if (admin && admin.aggregations) {
      await SuperAdmin.updateOne(
        { _id: userId },
        {
          $inc: {
            "aggregations.risk.high": -(admin.aggregations?.risk?.high || 0),
            "aggregations.risk.medium": -(
              admin.aggregations?.risk?.medium || 0
            ),
            "aggregations.risk.low": -(admin.aggregations?.risk?.low || 0),
            "aggregations.success": -(admin.aggregations?.success || 0),
            "aggregations.institute.active":
              admin.activeStatus === true ? -1 : 0,
            "aggregations.institute.inactive":
              admin.activeStatus === false ? -1 : 0,
          },
        },
        { session }
      );
    }

    await User.deleteMany({ instituteId }, { session });
    await Student.deleteMany({ instituteId }, { session });
    await deletedInstitute.deleteOne({ session });

    await session.commitTransaction();

    return res
      .status(200)
      .json({ success: true, message: "Deleted", data: deletedInstitute });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error occured while removing institute: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  } finally {
    await session.endSession();
  }
};

export const getCurrInstitute = async (req, res) => {
  const { user: currUser } = req;

  try {
    const institute = await Institute.findById(currUser.instituteId).populate(
      "adminId",
      "-hashedPassword"
    );

    return res.status(200).json({
      success: true,
      message: "institute fetched successfully",
      data: institute,
    });
  } catch (error) {
    console.error(`Error occured while getting current institute: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
