// controllers/mentor.controller.js
import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";
import axios from "axios";
import crypto from "crypto";

import Metadata from "../models/metadata.model.js";
import Student from "../models/student.model.js";
import { Mentor, Admin, SuperAdmin } from "../models/user.model.js";
import { normalize } from "../utils/authUtils.js";

export const uploadFile = async (req, res) => {
  const { user } = req;
  const files = req.files;

  if (!files?.length) {
    return res.status(400).json({ success: false, error: "No files uploaded" });
  }

  try {
    const metadata = await Metadata.find({ useInML: true });

    /** ----------------------------------------
     * Build alias → metadata map
     * ---------------------------------------*/
    const aliasMap = new Map();
    metadata.forEach((m) => {
      aliasMap.set(normalize(m.fieldKey), m);
      (m.synonyms || []).forEach((s) => aliasMap.set(normalize(s), m));
    });

    const results = [];

    for (const file of files) {
      let rows = [];
      const ext = file.originalname.split(".").pop().toLowerCase();

      /** ----------------------------------------
       * Parse file
       * ---------------------------------------*/
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
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Unsupported file type" });
      }

      if (!rows.length) {
        fs.unlinkSync(file.path);
        continue;
      }

      /** ----------------------------------------
       * Standardize rows using global metadata
       * ---------------------------------------*/
      const standardizedRows = rows.map((row) => {
        const out = {};

        Object.entries(row).forEach(([key, value]) => {
          const meta = aliasMap.get(normalize(key));
          if (meta) out[meta.fieldKey] = value;
        });

        // Apply defaults
        metadata.forEach((m) => {
          if (out[m.fieldKey] === undefined && m.defaultValue !== undefined) {
            out[m.fieldKey] = m.defaultValue;
          }
        });

        return out;
      });

      /** ----------------------------------------
       * Validate required metadata fields
       * ---------------------------------------*/
      const missingRequired = metadata
        .filter((m) => m.required)
        .filter((m) => standardizedRows[0]?.[m.fieldKey] === undefined);

      if (missingRequired.length) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          error: "Required fields missing",
          missingFields: missingRequired.map((m) => m.displayName),
        });
      }

      /** ----------------------------------------
       * Call ML service
       * ---------------------------------------*/
      const { data: predictions } = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { rows: standardizedRows }
      );

      /** ----------------------------------------
       * Persist students + compute aggregations
       * ---------------------------------------*/
      const riskCounters = { high: 0, medium: 0, low: 0 };
      let successCount = 0;

      for (let i = 0; i < predictions.length; i++) {
        const p = predictions[i];

        riskCounters[p.risk]++;
        if (p.success) successCount++;

        await Student.create({
          rollId: crypto.randomUUID(),
          instituteId: user.instituteId,
          mentorId: user.userId,
          riskValue: p.risk,
          success: p.success,
          standardizedInput: standardizedRows[i],
        });
      }

      /** ----------------------------------------
       * Update aggregations (mentor → admin → superAdmin)
       * ---------------------------------------*/
      await Mentor.findByIdAndUpdate(user.userId, {
        $inc: {
          "aggregations.risk.high": riskCounters.high,
          "aggregations.risk.medium": riskCounters.medium,
          "aggregations.risk.low": riskCounters.low,
          "aggregations.success": successCount,
        },
      });

      await Admin.findOneAndUpdate(
        { instituteId: user.instituteId },
        {
          $inc: {
            "aggregations.risk.high": riskCounters.high,
            "aggregations.risk.medium": riskCounters.medium,
            "aggregations.risk.low": riskCounters.low,
            "aggregations.success": successCount,
          },
        }
      );

      await SuperAdmin.updateOne(
        {},
        {
          $inc: {
            "aggregations.risk.high": riskCounters.high,
            "aggregations.risk.medium": riskCounters.medium,
            "aggregations.risk.low": riskCounters.low,
            "aggregations.success": successCount,
          },
        }
      );

      results.push({
        fileName: file.originalname,
        totalRows: predictions.length,
        riskSummary: riskCounters,
        successCount,
      });

      fs.unlinkSync(file.path);
    }

    return res.status(200).json({
      success: true,
      message: "Files processed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
