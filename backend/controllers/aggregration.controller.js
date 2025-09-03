export const superAdminAggreg = async (req, res) => {
  try {
  } catch (error) {
    console.error(`Error occured while fetching aggregations: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const adminAggreg = async (req, res) => {};
