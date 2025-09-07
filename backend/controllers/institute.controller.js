import Institute from "../models/institute.model.js";
import { Admin, SuperAdmin, User } from "../models/user.model.js";
import stringSimilarity from "string-similarity";
import Metadata from "../models/metadata.model.js";
import mongoose from "mongoose";
import Student from "../models/student.model.js";
import { normalize } from "../utils/configUtils.js";

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

  if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId))
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
  const { userId } = req.user;
  const session = await mongoose.startSession();

  if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
    return res.status(401).json({ success: false, error: "Invalid id" });
  }

  try {
    session.startTransaction();

    const deletedInstitute = await Institute.findById(instituteId)
      .select("-config")
      .populate("adminId", "-hashedPassword");

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

export const generateDraftConfig = async (req, res) => {
  try {
    const { headers } = req.body;
    const institute = await Institute.findById(req.user.instituteId);

    if (institute.config.locked) {
      return res.status(400).json({
        success: false,
        error:
          "Configuration is already locked. Please contact an administrator if you believe this is an error.",
      });
    }

    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({
        success: false,
        error: "A 'headers' array is required in the request body.",
      });
    }

    const metadata = await Metadata.find({});
    const candidates = metadata.flatMap((m) => [
      { fieldKey: m.fieldKey, meta: m },
      ...(m.synonyms || []).map((syn) => ({
        fieldKey: m.fieldKey,
        meta: m,
        synonym: syn,
      })),
    ]);

    const initialDraft = headers.filter(Boolean).map((header) => {
      const normHeader = normalize(header);

      const bestMatch = candidates
        .map((candidate) => {
          const target = normalize(candidate.synonym || candidate.fieldKey);
          const rating = stringSimilarity.compareTwoStrings(normHeader, target);
          return { ...candidate, rating };
        })
        .sort((a, b) => b.rating - a.rating)[0];

      const fieldMeta =
        bestMatch && bestMatch.rating > 0.5 ? bestMatch.meta : null;

      return {
        csvHeader: normHeader,
        fieldKey: fieldMeta ? fieldMeta.fieldKey : null,
        type: fieldMeta ? fieldMeta.type : "string",
        required: fieldMeta ? fieldMeta.required : false,
        transformations: [],
      };
    });

    const seenFieldKeys = new Set();
    const finalDraft = initialDraft.filter((item) => {
      if (!item.fieldKey) return true;
      if (seenFieldKeys.has(item.fieldKey)) return false;
      seenFieldKeys.add(item.fieldKey);
      return true;
    });

    const requiredMetadataFields = metadata.filter((m) => m.required);
    const mappedFieldKeys = new Set(
      finalDraft.map((item) => item.fieldKey).filter(Boolean)
    );

    const missingRequiredFields = requiredMetadataFields
      .filter((meta) => !mappedFieldKeys.has(meta.fieldKey))
      .map((meta) => ({
        fieldKey: meta.fieldKey,
        displayName: meta.displayName,
      }));

    res.status(200).json({
      success: true,
      message: "Draft configuration created successfully.",
      data: finalDraft,
      missingFields: missingRequiredFields,
    });
  } catch (err) {
    console.error("Error generating draft config:", err);
    res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { user } = req;
    let { columns } = req.body;

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Only admins can update config" });
    }

    columns = columns
      .filter((column) => column.fieldKey)
      .map((c) => ({ ...c, csvHeader: normalize(c.csvHeader) }));

    const requiredMetadata = await Metadata.find({ required: true });
    const providedFieldKeys = new Set(columns.map((c) => c.fieldKey));

    const missingFields = requiredMetadata
      .filter((meta) => !providedFieldKeys.has(meta.fieldKey))
      .map((meta) => meta.displayName);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot save configuration. The following required fields are missing: ${missingFields.join(
          ", "
        )}.`,
      });
    }

    const institute = await Institute.findById(user.instituteId);
    if (!institute) {
      return res
        .status(404)
        .json({ success: false, error: "Institute not found" });
    }

    if (institute.config?.locked) {
      return res
        .status(400)
        .json({ success: false, error: "Config is locked" });
    }

    institute.config.columns = columns;
    institute.config.updatedAt = new Date();

    await institute.save();

    res.status(200).json({
      success: true,
      message: "Config saved successfully",
      config: institute.config,
    });
  } catch (err) {
    console.error("Error saving config:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const lockConfig = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { lock } = req.body;
    const { user } = req;

    const institute = await Institute.findById(instituteId);
    if (!institute)
      return res
        .status(404)
        .json({ success: false, error: "Institute not found" });

    if (lock === true) {
      const currentConfig = institute.config?.columns || [];
      if (currentConfig.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Cannot lock an empty configuration.",
        });
      }

      const requiredMetadata = await Metadata.find({ required: true });
      const mappedFieldKeys = new Set(
        currentConfig.map((c) => c.fieldKey).filter(Boolean)
      );

      const missingFields = requiredMetadata
        .filter((meta) => !mappedFieldKeys.has(meta.fieldKey))
        .map((meta) => meta.displayName);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot lock configuration. The following required fields are missing or unmapped: ${missingFields.join(
            ", "
          )}.`,
        });
      }
    }

    if (lock === false && user.role !== "superAdmin") {
      return res
        .status(403)
        .json({ success: false, error: "Only SuperAdmin can unlock config" });
    }

    institute.config.locked = lock;
    institute.config.updatedAt = new Date();
    await institute.save();

    res.status(200).json({
      success: true,
      message: lock
        ? "Config locked successfully"
        : "Config unlocked by superAdmin",
      locked: institute.config.locked,
    });
  } catch (err) {
    console.error("Error locking config:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
