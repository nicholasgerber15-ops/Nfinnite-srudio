/**
 * Application entry point
 */

import express, { Express } from 'express';
import dotenv from 'dotenv';
import { Logger } from './logging/logger.js';
import { Engine } from './core/engine.js';
import { setupRoutes } from './api/routes/index.js';
import { errorMiddleware } from './api/middleware/error.middleware.js';

dotenv.config();

const logger = new Logger('Main');

async function bootstrap(): Promise<void> {
  const app: Express = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize engine
  const engine = new Engine();
  await engine.initialize();
  logger.info('Engine initialized successfully');

  // Store engine in app context
  app.locals.engine = engine;

  // Setup routes
  setupRoutes(app);

  // Error handling
  app.use(errorMiddleware);

  // Start server
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});
