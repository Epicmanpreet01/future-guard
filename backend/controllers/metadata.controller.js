import Metadata from "../models/metadata.model.js";

export const getMetaData = async (req, res) => {
  try {
    const metadata = await Metadata.find();

    return res.status(200).json({
      success: true,
      message: "metadata fetched successfully",
      data: metadata,
    });
  } catch (error) {
    console.error(`Error occured while fetching metadata: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
