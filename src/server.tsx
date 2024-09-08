import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import winston from 'winston';
import { analyzeWebsite } from './utils/analyzeWebsite';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import http from 'http';

async function startServer() {
  const app = express();

  // Create a logger instance
  const logger = winston.createLogger({
    level: 'verbose',
    format: winston.format.json(),
    transports: [new winston.transports.File({ filename: 'server.log' })],
    exitOnError: false,
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  // Use Vite's middleware to handle requests and enable HMR
  app.use(vite.middlewares);

  app.use(cors());
  app.use(express.json());

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error occurred:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  });

  app.post('/analyze', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      logger.info(`Received analysis request for URL: ${url}`);
      const result = await analyzeWebsite(url, { rejectUnauthorized: false });
      logger.info(`Analyzed website: ${url}`);
      res.json(result);
    } catch (error: any) {
      logger.error(`Error analyzing website: ${req.body.url}`, error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  });

  // Serve index.html for all routes
  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, path.resolve(__dirname, 'index.html'));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const server = http.createServer(app);

  server.listen(3001, () => {
    logger.info('Server listening on port 3001');
    console.log('Server listening on port 3001');
  });

  // Catch unhandled exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Unhandled exception:', error);
    process.exit(1);
  });

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled rejection:', reason);
    process.exit(1);
  });

  // Redirect console output to server.log
  console.log = (...args) => logger.info(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  console.warn = (...args) => logger.warn(args.join(' '));
  console.info = (...args) => logger.info(args.join(' '));
  console.debug = (...args) => logger.debug(args.join(' '));
}

startServer();