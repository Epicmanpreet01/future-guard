import Institute from "../models/institute.model.js";
import User from "../models/user.model.js";

export const getInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find()
      .select("-config")
      .populate("adminId", "-hashedPassword");

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

  if (!instituteId)
    return res.status(400).json({ success: false, error: "Invalid id" });

  try {
    const institutes = await Institute.find({ _id: instituteId })
      .select("-config")
      .populate("adminId", "-hashedPassword");

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

  if (!instituteId)
    return res.status(401).json({ success: false, error: "Invalid id" });

  try {
    const deletedInstitute = await Institute.findById(instituteId)
      .select("-config")
      .populate("adminId", "-hashedPassword");
    if (!deletedInstitute)
      return res
        .status(404)
        .json({ success: false, error: "Institute not found" });

    await deletedInstitute.deleteOne();

    await User.deleteMany({ instituteId });

    return res
      .status(200)
      .json({ success: true, message: "Deleted", data: deletedInstitute });
  } catch (error) {
    console.error(`Error occured while removing institute: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
