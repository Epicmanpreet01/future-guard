export const uploadFile = async (req, res) => {
  const { user } = req;
  const files = req.files;

  if (!files?.length) {
    return res.status(400).json({ success: false, error: "No files uploaded" });
  }

  try {
    const metadata = await Metadata.find({ useInML: true });

    /* ----------------------------------------
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
       * Standardize rows
       * ---------------------------------------*/
      const standardizedRows = rows.map((row) => {
        const out = {};

        Object.entries(row).forEach(([key, value]) => {
          const meta = aliasMap.get(normalize(key));
          if (meta) out[meta.fieldKey] = value;
        });

        metadata.forEach((m) => {
          if (out[m.fieldKey] === undefined && m.defaultValue !== undefined) {
            out[m.fieldKey] = m.defaultValue;
          }
        });

        return out;
      });

      /* ----------------------------------------
       * Call ML service
       * ---------------------------------------*/
      const payload = {
        students: standardizedRows.map((row) => ({
          id: crypto.randomUUID(),
          features: row,
        })),
      };

      const { data } = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        payload
      );

      const predictions = data.results;

      /* ----------------------------------------
       * Counters (response-only)
       * ---------------------------------------*/
      const riskCounters = { high: 0, medium: 0, low: 0 };
      let successCount = 0;

      /* ----------------------------------------
       * Student upsert + aggregation updates
       * ---------------------------------------*/
      for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        const newRisk = prediction.risk_label.toLowerCase();

        const rollId = standardizedRows[i].studentId || crypto.randomUUID();

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

          // 🔥 Adjust risk aggregations ONLY if risk changed
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
          // New student
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
            {
              $inc: { [`aggregations.risk.${newRisk}`]: 1 },
            }
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
      }

      /* ----------------------------------------
       * Increment success counters
       * ---------------------------------------*/
      if (successCount > 0) {
        await Mentor.findByIdAndUpdate(user.userId, {
          $inc: { "aggregations.success": successCount },
        });

        await Admin.findOneAndUpdate(
          { instituteId: user.instituteId },
          {
            $inc: { "aggregations.success": successCount },
          }
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
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
