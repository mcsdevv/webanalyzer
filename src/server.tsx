import express from "express";
import cors from "cors";
import { analyzeWebsite } from "../api/utils/_analyzeWebsite";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    console.log("Analyzing URL:", url);
    const result = await analyzeWebsite(url, { rejectUnauthorized: false });
    console.log("Analysis result:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing website:", error);
    return res.status(500).json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
