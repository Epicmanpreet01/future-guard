import { Admin, SuperAdmin, User } from "../models/user.model.js";

export const superAdminAggreg = async (req, res) => {
  const { user: currUser } = req;
  try {
    const aggregations = await SuperAdmin.findById(currUser.userId).select(
      "aggregations"
    );

    if (!aggregations)
      return res.status(404).json({ success: false, error: "no aggreg found" });

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
    const aggregations = await Admin.findById(currUser.userId).select(
      "aggregations"
    );
    if (!aggregations)
      return res
        .status(404)
        .json({ success: false, error: "aggregations not found" });

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
