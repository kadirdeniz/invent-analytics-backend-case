import { DataSource } from "typeorm";
import { ConfigService } from "./config";
import logger from "../utils/logger";
import { UserEntity } from "../models/entities/User";
import { BookEntity } from "../models/entities/Book";
import { UserBookHistoryEntity } from "../models/entities/UserBookHistory";

const config = new ConfigService();

logger.info("Database configuration", {
  host: config.get("DB_HOST"),
  port: config.get("DB_PORT"),
  database: config.get("DB_NAME"),
  username: config.get("DB_USER"),
});

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.get("DB_HOST"),
  port: Number(config.get("DB_PORT")),
  username: config.get("DB_USER"),
  password: config.get("DB_PASSWORD"),
  database: config.get("DB_NAME"),
  synchronize: config.get("NODE_ENV") === "development",
  logging: config.get("NODE_ENV") === "development",
  entities: [UserEntity, BookEntity, UserBookHistoryEntity],
  migrations: [],
});

let isInitialized = false;

export async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await AppDataSource.initialize();
      isInitialized = true;
      logger.info("Database initialized successfully");
    } catch (error) {
      logger.error("Error during database initialization", { error });
      throw error;
    }
  }
  return AppDataSource;
}

// Getter fonksiyonu ekleyelim
export function getDataSource(): DataSource {
  if (!isInitialized) {
    throw new Error("Database is not initialized");
  }
  return AppDataSource;
}
