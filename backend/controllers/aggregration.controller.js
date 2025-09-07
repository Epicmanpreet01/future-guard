import { Admin, SuperAdmin, User } from "../models/user.model.js";

export const superAdminAggreg = async (req, res) => {
  const { user: currUser } = req;
  try {
    const superAdminDoc = await SuperAdmin.findById(currUser.userId).select(
      "aggregations"
    );

    if (!superAdminDoc || !superAdminDoc.aggregations) {
      return res.status(404).json({ success: false, error: "no aggreg found" });
    }

    const aggregations =
      superAdminDoc.aggregations.toObject?.() || superAdminDoc.aggregations;

    const risk = aggregations.risk || { high: 0, medium: 0, low: 0 };
    const institute = aggregations.institute || { active: 0, inactive: 0 };

    aggregations.risk = {
      ...risk,
      total: (risk.high || 0) + (risk.medium || 0) + (risk.low || 0),
    };

    aggregations.institute = {
      ...institute,
      total: (institute.active || 0) + (institute.inactive || 0),
    };

    return res.status(200).json({
      success: true,
      message: "Aggregations fetched successfully",
      data: aggregations,
    });
  } catch (error) {
    console.error(`Error occured while fetching aggregations: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const adminAggreg = async (req, res) => {
  const { user: currUser } = req;

  try {
    const adminDoc = await Admin.findById(currUser.userId).select(
      "aggregations"
    );
    if (!adminDoc)
      return res
        .status(404)
        .json({ success: false, error: "aggregations not found" });

    const aggregations =
      adminDoc.aggregations.toObject?.() || adminDoc.aggregations;

    const risk = aggregations.risk || { high: 0, medium: 0, low: 0 };
    const mentor = aggregations.mentor || { active: 0, inactive: 0 };

    aggregations.risk = {
      ...risk,
      total: (risk.high || 0) + (risk.medium || 0) + (risk.low || 0),
    };

    aggregations.mentor = {
      ...mentor,
      total: (mentor.active || 0) + (mentor.inactive || 0),
    };

    return res.status(200).json({
      success: true,
      message: "aggregations found successfully",
      data: aggregations,
    });
  } catch (error) {
    console.error(`Error occured while fetching aggregations: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const mentorAggreg = async (req, res) => {
  const { user: currUser } = req;

  try {
    const mentorDoc = await Admin.findById(currUser.userId);
    if (!mentorDoc)
      return res
        .status(404)
        .json({ success: false, error: "Aggregations not found" });

    const aggregations =
      mentorDoc.aggregations.toObject?.() || mentorDoc.aggregations;

    const risk = aggregations.risk || { high: 0, medium: 0, low: 0 };

    aggregations.risk = {
      ...risk,
      total: (risk.high || 0) + (risk.medium || 0) + (risk.low || 0),
    };

    return res.status(200).json({
      success: true,
      message: "aggregations found successfully",
      data: aggregations,
    });
  } catch (error) {
    console.error(`Error occured fetching aggregations: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
