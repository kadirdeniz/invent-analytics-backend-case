import express from "express";
import { container } from "./config/container";
import { requestId } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { jsonErrorHandler } from "./middleware/jsonErrorHandler";
import { healthRouter } from "./routes/healthRouter";
import { createBookRouter } from "./routes/BookRouter";
import logger from "./utils/logger";
import { createUserRouter } from "./routes/UserRouter";

function createApp() {
  try {
    const app = express();

    // Middleware setup
    setupMiddleware(app);

    // Routes setup
    setupRoutes(app);

    // Error handling
    setupErrorHandling(app);

    return app;
  } catch (error) {
    logger.error("Error creating app", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

function setupMiddleware(app: express.Application) {
  app.use(express.json());
  app.use(requestId);
  app.use(requestLogger);
}

function setupRoutes(app: express.Application) {
  logger.info("Setting up routes");

  app.use("/health", healthRouter);
  app.use("/users", createUserRouter(container.resolve("userController")));
  app.use("/books", createBookRouter(container.resolve("bookController")));
}

function setupErrorHandling(app: express.Application) {
  app.use(jsonErrorHandler);
  app.use(errorHandler);
}

export const app = createApp();
