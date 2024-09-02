import express from "express";
import cors from "cors";
import { analyzeWebsite } from "./utils/analyzer"; // Import the analyzeWebsite function

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await analyzeWebsite(url);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
});
app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
