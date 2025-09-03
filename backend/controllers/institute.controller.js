import Institute from "../models/institute.model.js";
import User from "../models/user.model.js";
import stringSimilarity from "string-similarity";
import Metadata from "../models/metadata.model.js";

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

export const generateDraftConfig = async (req, res) => {
  try {
    const { headers } = req.body;

    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ message: "Headers array required" });
    }

    const metadata = await Metadata.find({});
    const fieldKeys = metadata.map((m) => m.fieldKey);

    const draft = headers.map((header) => {
      const match = stringSimilarity.findBestMatch(header, fieldKeys);
      const bestKey =
        match.bestMatch.rating > 0.6 ? match.bestMatch.target : null;

      const fieldMeta = bestKey
        ? metadata.find((m) => m.fieldKey === bestKey)
        : null;

      return {
        csvHeader: header,
        fieldKey: fieldMeta ? fieldMeta.fieldKey : null,
        type: fieldMeta ? fieldMeta.type : "string",
        required: fieldMeta ? fieldMeta.required : false,
        transformations: [],
      };
    });

    res.status(200).json({ draft });
  } catch (err) {
    console.error("Error generating draft config:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { user } = req;
    const { instituteId, columns } = req.body;

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update config" });
    }

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    if (institute.config.locked) {
      return res.status(400).json({ message: "Config is locked" });
    }

    institute.config.columns = columns;
    institute.config.updatedAt = new Date();

    await institute.save();

    res.status(200).json({
      message: "Config saved successfully",
      config: institute.config,
    });
  } catch (err) {
    console.error("Error saving config:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const lockConfig = async (req, res) => {
  try {
    const { instituteId, lock } = req.body;
    const { user } = req;

    const institute = await Institute.findById(instituteId);
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    if (!institute.config || !institute.config.columns.length) {
      return res.status(400).json({ message: "No config set yet" });
    }

    if (lock === false && user.role !== "superAdmin") {
      return res
        .status(403)
        .json({ message: "Only SuperAdmin can unlock config" });
    }

    institute.config.locked = lock;
    institute.config.updatedAt = new Date();
    await institute.save();

    res.status(200).json({
      message: lock ? "Config locked" : "Config unlocked by superAdmin",
      locked: institute.config.locked,
    });
  } catch (err) {
    console.error("Error locking config:", err);
    res.status(500).json({ message: "Server error" });
  }
};
