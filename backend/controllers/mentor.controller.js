import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";
import axios from "axios";

import Metadata from "../models/metadata.model.js";
import Student from "../models/student.model.js";
import { Mentor, Admin, SuperAdmin } from "../models/user.model.js";
import { mapToMLFeatures } from "../utils/mlFeatureMapper.js";

/* ----------------------------------------
 * Strong normalization helpers
 * ---------------------------------------*/
const normalizeKey = (key = "") =>
  key
    .toString()
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove (%, etc)
    .replace(/[%?]/g, "")
    .replace(/[_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (val == null) return undefined;
  const v = val.toString().toLowerCase().trim();
  if (["true", "yes", "y", "1", "paid"].includes(v)) return true;
  if (["false", "no", "n", "0", "unpaid", "pending"].includes(v)) return false;
  return undefined;
};

const normalizeNumber = (val) => {
  if (val == null || val === "") return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
};

export const uploadFile = async (req, res) => {
  const { user } = req;
  const files = req.files;

  if (!files?.length) {
    return res.status(400).json({
      success: false,
      error: "No files uploaded",
    });
  }

  try {
    const metadata = await Metadata.find({});

    /* ----------------------------------------
     * Required fields
     * ---------------------------------------*/
    const requiredFields = metadata
      .filter((m) => m.required)
      .map((m) => m.fieldKey);

    /* ----------------------------------------
     * Build enhanced alias → metadata map
     * ---------------------------------------*/
    const aliasMap = new Map();

    metadata.forEach((m) => {
      // main key
      aliasMap.set(normalizeKey(m.fieldKey), m);

      // display name
      if (m.displayName) {
        aliasMap.set(normalizeKey(m.displayName), m);
      }

      // synonyms
      (m.synonyms || []).forEach((s) => {
        aliasMap.set(normalizeKey(s), m);
      });

      // common auto-variants
      aliasMap.set(normalizeKey(m.fieldKey.replace(/([A-Z])/g, " $1")), m);
      aliasMap.set(normalizeKey(m.fieldKey.replace(/([A-Z])/g, "_$1")), m);
    });

    const results = [];

    for (const file of files) {
      let rows = [];
      const ext = file.originalname.split(".").pop().toLowerCase();

      /* ----------------------------------------
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
        return res.status(400).json({
          success: false,
          error: "Unsupported file type",
        });
      }

      if (!rows.length) {
        fs.unlinkSync(file.path);
        continue;
      }

      /* ----------------------------------------
       * Standardize rows (ROBUST MAPPING)
       * ---------------------------------------*/
      const standardizedRows = rows.map((row, index) => {
        const ml = {};
        const identity = {};

        Object.entries(row).forEach(([rawKey, rawValue]) => {
          const meta = aliasMap.get(normalizeKey(rawKey));
          if (!meta) return;

          let value = rawValue;

          if (meta.type === "number") {
            value = normalizeNumber(rawValue);
          }

          if (meta.type === "boolean") {
            value = normalizeBoolean(rawValue);
          }

          if (meta.useInML) {
            ml[meta.fieldKey] = value;
          } else {
            identity[meta.fieldKey] = value;
          }
        });

        // defaults for ML fields
        metadata.forEach((m) => {
          if (
            m.useInML &&
            ml[m.fieldKey] === undefined &&
            m.defaultValue !== undefined
          ) {
            ml[m.fieldKey] = m.defaultValue;
          }
        });

        const merged = { ...ml, ...identity };

        /* ----------------------------------------
         * REQUIRED FIELD CHECK (EARLY FAIL)
         * ---------------------------------------*/
        const missing = requiredFields.filter(
          (f) =>
            merged[f] === undefined || merged[f] === null || merged[f] === ""
        );

        if (missing.length > 0) {
          throw new Error(
            `Row ${index + 1} is missing required fields: ${missing.join(", ")}`
          );
        }

        return merged;
      });

      /* ----------------------------------------
       * Call ML service
       * ---------------------------------------*/
      const payload = {
        students: standardizedRows.map((row) => ({
          id: row.studentId, // ✅ REAL rollId
          features: mapToMLFeatures(row),
        })),
      };

      const { data } = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        payload
      );

      const predictions = data.results;

      /* ----------------------------------------
       * Counters
       * ---------------------------------------*/
      const riskCounters = { high: 0, medium: 0, low: 0 };
      let successCount = 0;
      const studentsTable = [];

      /* ----------------------------------------
       * Student upsert + aggregation updates
       * ---------------------------------------*/
      for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        const row = standardizedRows[i];
        const newRisk = prediction.risk_label.toLowerCase();
        const rollId = prediction.id;

        const existing = await Student.findOne({
          rollId,
          instituteId: user.instituteId,
        });

        let success = false;

        if (existing) {
          const oldRisk = existing.riskValue;
          success =
            (oldRisk === "high" || oldRisk === "medium") && newRisk === "low";

          await Student.updateOne(
            { rollId, instituteId: user.instituteId },
            {
              $set: {
                previousRiskValue: oldRisk,
                riskValue: newRisk,
                success,
                lastUpdatedByMentor: user.userId,
              },
            }
          );

          if (oldRisk !== newRisk) {
            await Mentor.findByIdAndUpdate(user.userId, {
              $inc: {
                [`aggregations.risk.${oldRisk}`]: -1,
                [`aggregations.risk.${newRisk}`]: 1,
              },
            });
            await Admin.findOneAndUpdate(
              { instituteId: user.instituteId },
              {
                $inc: {
                  [`aggregations.risk.${oldRisk}`]: -1,
                  [`aggregations.risk.${newRisk}`]: 1,
                },
              }
            );
            await SuperAdmin.updateOne(
              {},
              {
                $inc: {
                  [`aggregations.risk.${oldRisk}`]: -1,
                  [`aggregations.risk.${newRisk}`]: 1,
                },
              }
            );
          }
        } else {
          await Student.create({
            rollId,
            instituteId: user.instituteId,
            riskValue: newRisk,
            success: false,
            lastUpdatedByMentor: user.userId,
          });

          await Mentor.findByIdAndUpdate(user.userId, {
            $inc: { [`aggregations.risk.${newRisk}`]: 1 },
          });
          await Admin.findOneAndUpdate(
            { instituteId: user.instituteId },
            { $inc: { [`aggregations.risk.${newRisk}`]: 1 } }
          );
          await SuperAdmin.updateOne(
            {},
            {
              $inc: { [`aggregations.risk.${newRisk}`]: 1 },
            }
          );
        }

        riskCounters[newRisk]++;
        if (success) successCount++;

        studentsTable.push({
          rollId,
          studentName: row.studentName,
          riskLabel: newRisk,
          riskScore: prediction.risk_score,
          success,
          explanation: prediction.explanation,
          recommendation: prediction.recommendation,
          features: row,
        });
      }

      if (successCount > 0) {
        await Mentor.findByIdAndUpdate(user.userId, {
          $inc: { "aggregations.success": successCount },
        });
        await Admin.findOneAndUpdate(
          { instituteId: user.instituteId },
          { $inc: { "aggregations.success": successCount } }
        );
        await SuperAdmin.updateOne(
          {},
          {
            $inc: { "aggregations.success": successCount },
          }
        );
      }

      results.push({
        fileName: file.originalname,
        totalRows: predictions.length,
        riskSummary: riskCounters,
        successCount,
        students: studentsTable,
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
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
