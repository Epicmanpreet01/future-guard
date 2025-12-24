import axios from "axios";
import crypto from "crypto";

const ML_URL = "http://localhost:8000/predict";

async function testML() {
  const payload = {
    students: [
      {
        id: crypto.randomUUID(),
        features: {
          // categorical (binary / encoded)
          studyMode: 0,
          previousEducation: 2,
          displacedStatus: 0,
          specialNeeds: 0,
          gender: 1,
          scholarShipStatus: 1,
          international: 0,
          parentEducation: 2,
          parentEmployentStatus: 1,
          feesPaid: 1,
          notEnrolled: 0,

          // continuous
          ageAtEnrollment: 19,
          totalCreditsEnrolled: 45,
          totalCreditsApproved: 40,
          cgpa: 8.2,
        },
      },

      {
        id: crypto.randomUUID(),
        features: {
          studyMode: 0,
          previousEducation: 1,
          displacedStatus: 1,
          specialNeeds: 1,
          gender: 0,
          scholarShipStatus: 0,
          international: 0,
          parentEducation: 1,
          parentEmployentStatus: 0,
          feesPaid: 0,
          notEnrolled: 1,

          ageAtEnrollment: 22,
          totalCreditsEnrolled: 10,
          totalCreditsApproved: 2,
          cgpa: 3.1,
        },
      },
    ],
  };

  try {
    const { data } = await axios.post(ML_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("\n✅ ML Service Response:\n");
    console.dir(data, { depth: null });
  } catch (err) {
    console.error("\n❌ ML Service Error:", err.response?.data || err.message);
  }
}

testML();
