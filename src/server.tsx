import express from "express";
import cors from "cors";
import winston from "winston";
import { analyzeWebsite } from "./utils/analyzer";

// Create a logger instance
const logger = winston.createLogger({
  level: "verbose",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "server.log" }),
  ],
  exitOnError: false, // Prevents process exit on error
});

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await analyzeWebsite(url);
    logger.info(`Analyzed website: ${url}`);
    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.listen(3001, () => {
  logger.info("Server listening on port 3001");
});

// Catch unhandled exceptions
process.on("uncaughtException", (error) => {
  logger.error(error);
  process.exit(1);
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error(reason);
  process.exit(1);
});

// Redirect console output to server.log// Redirect console output to server.log
console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));
console.warn = (...args) => logger.warn(args.join(' '));
console.info = (...args) => logger.info(args.join(' '));
console.debug = (...args) => logger.debug(args.join(' '));