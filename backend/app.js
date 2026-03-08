import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import instituteRoutes from "./routes/institute.route.js";
import aggregationRoutes from "./routes/aggregation.route.js";
import metadataRoutes from "./routes/metadata.route.js";
import mentorRoutes from "./routes/mentor.route.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (process.env.MODE !== "production") {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.MODE !== "production") {
  app.get("/", (_req, res) =>
    res.status(200).json({ message: "API is running..." }),
  );
}

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/aggregation", aggregationRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/mentor", mentorRoutes);

if (process.env.MODE === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();

    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3000;

try {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
} catch (error) {
  console.error("Error connecting to DB:", error);
  process.exit(1);
}
// Trigger nodemon restart
