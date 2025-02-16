import "reflect-metadata";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
import logger from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Import app after database initialization
    const app = (await import("./app")).app;

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled rejection", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

startServer();
