import dotenv from "dotenv";
import logger from "../utils/logger";
import { UserBookHistoryEntity } from "@/models/entities/UserBookHistory";
import { BookEntity } from "@/models/entities/Book";
import { UserEntity } from "@/models/entities/User";
import { AppDataSource } from "@/config/database";

// Load test environment variables
dotenv.config({ path: ".env.test" });
logger.info("Test environment loaded");

if (process.env.TEST_SUITE === "repository") {
  beforeAll(async () => {
    await AppDataSource.initialize();
    logger.info("Test database initialized");
  });

  beforeEach(async () => {
    // Önce child tabloları temizle
    await AppDataSource.getRepository(UserBookHistoryEntity).delete({});
    // Sonra parent tabloları temizle
    await AppDataSource.getRepository(BookEntity).delete({});
    await AppDataSource.getRepository(UserEntity).delete({});
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
}
