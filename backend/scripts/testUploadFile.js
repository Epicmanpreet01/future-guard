import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

// ---------------- CONFIG ----------------
const BASE_URL = "http://localhost:5000";
const EMAIL = "sumitkumarpunjab@gmail.com";
const PASSWORD = "Manpreet@2005";
const FILE_PATH = "./test-students.csv";
// ----------------------------------------

const jar = new CookieJar();
const client = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar,
    withCredentials: true,
  })
);

async function login() {
  console.log("🔐 Logging in...");

  const res = await client.post(
    "/api/auth/login",
    { email: EMAIL, password: PASSWORD },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("✅ Login successful");
  return res.data;
}

async function uploadFile() {
  console.log("📤 Uploading file...");

  const form = new FormData();
  form.append("files", fs.createReadStream(FILE_PATH));

  const res = await client.post("/api/mentor/upload", form, {
    headers: {
      ...form.getHeaders(), // IMPORTANT
    },
    maxBodyLength: Infinity,
  });

  console.log("\n✅ Upload response:\n");
  console.dir(res.data, { depth: null });
}

async function run() {
  try {
    await login();
    await uploadFile();
  } catch (err) {
    console.error("\n❌ Error:", err.response?.data || err.message);
  }
}

run();
