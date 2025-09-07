import Institute from "../models/institute.model";
import axios from "axios";
import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";
import { normalize } from "../utils/configUtils.js";

export const uploadFile = async (req, res) => {
  const { user: currUser } = req;
  const files = req.files;

  if (!files?.length)
    return res.status(400).json({ success: false, error: "Invalid input" });

  try {
    const config = await Institute.findById(currUser.instituteId);
    let combinedResults = [];

    for (const file of files) {
      let rows = [];
      const ext = file.originalname.split(".").pop().toLowerCase();

      if (ext === "csv") {
        rows = await new Promise((resolve, reject) => {
          const temp = [];
          fs.createReadStream(file.path)
            .pipe(csv())
            .on("data", (row) => temp.push(row))
            .on("end", () => resolve(temp))
            .on("error", reject);
        });
      } else if (ext === "xls" || ext === "xlsx") {
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Unsupported file type" });
      }

      const headers = Object.keys(rows[0] || {}).map(normalize);

      const requiredConfig = config.config.columns.filter((c) => c.required);
      const requiredFields = requiredConfig.map((f) => normalize(f.csvHeader));

      const missingValues = requiredFields.filter(
        (field) => !headers.includes(field)
      );

      if (missingValues?.length)
        return res.status(400).json({
          success: false,
          error: "Required fields missing",
          missingValues,
        });

      const { data: predictions } = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { rows }
      );

      combinedResults.push({
        fileName: file.originalname,
        original: rows,
        predictions,
      });

      fs.unlinkSync(file.path);
    }

    return res.status(200).json({
      success: true,
      message: "Predictions made successfully",
      data: combinedResults,
    });
  } catch (error) {
    console.error(`Error occurred while uploading files: ${error}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
