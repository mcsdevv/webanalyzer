import express from 'express';
import cors from 'cors';
import winston from 'winston';
import { analyzeWebsite } from './utils/analyzeWebsite';

// Create a logger instance
const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'server.log' })],
  exitOnError: false,
});

const app = express();

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    console.log(`Received analysis request for URL: ${url}`);
    logger.info(`Received analysis request for URL: ${url}`);

    const result = await analyzeWebsite(url);

    logger.info(`Analyzed website: ${url}`);
    res.json(result);
  } catch (error) {
    logger.error(`Error analyzing website: ${req.body.url}`, error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.listen(3001, () => {
  logger.info('Server listening on port 3001');
  console.log('Server listening on port 3001');
});

// Catch unhandled exceptions
process.on('uncaughtException', (error) => {
  logger.error('Unhandled exception:', error);
  process.exit(1);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Redirect console output to server.log
console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));
console.warn = (...args) => logger.warn(args.join(' '));
console.info = (...args) => logger.info(args.join(' '));
console.debug = (...args) => logger.debug(args.join(' '));