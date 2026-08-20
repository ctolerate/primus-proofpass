import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const APP_ID = process.env.PRIMUS_APP_ID;
const APP_SECRET = process.env.PRIMUS_APP_SECRET;

const primusZKTLS = new PrimusZKTLS();

await primusZKTLS.init(APP_ID, APP_SECRET, {
  env: "development",
});

app.post("/api/sign", async (req, res) => {
  try {
    const { request } = req.body;

    if (!request) {
      return res.status(400).json({
        error: "Missing request",
      });
    }

    console.log("Signing attestation request...");

    const signedRequest = await primusZKTLS.sign(request);

    res.json({
      signedRequest,
    });
  } catch (error) {
    console.error("Signing error:", error);

    res.status(500).json({
      error: error?.message || String(error),
    });
  }
});

app.listen(3001, () => {
  console.log("ProofPass backend running on http://localhost:3001");
});