// Mock container before other imports
jest.mock("../../config/container", () => ({
  container: {
    resolve: jest.fn().mockImplementation((name: string) => {
      if (name === "bookController") {
        return {
          getBooks: jest.fn(),
          getBookById: jest.fn(),
          createBook: jest.fn(),
        };
      }
    }),
  },
}));

// Singleton instance'ı mock'la
jest.mock("../BookRouter", () => {
  const actual = jest.requireActual("../BookRouter");
  return {
    ...actual,
    bookRouter: undefined, // Singleton'ı devre dışı bırak
  };
});

import request from "supertest";
import express from "express";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../middleware/errorHandler";
import { jsonErrorHandler } from "../../middleware/jsonErrorHandler";
import { createBookRouter } from "../BookRouter";
import { BookController } from "../../controllers/BookController";
import { BookNotFoundError } from "@/models/errors/BookErrors";

describe("BookRouter", () => {
  let app: express.Application;
  let mockBookController: jest.Mocked<BookController>;

  beforeEach(() => {
    // Mock controller setup
    mockBookController = {
      getBooks: jest.fn(),
      getBookById: jest.fn(),
      createBook: jest.fn(),
    } as unknown as jest.Mocked<BookController>;

    // Express app setup
    app = express();
    app.use(express.json());
    app.use(jsonErrorHandler);
    app.use("/books", createBookRouter(mockBookController));
    app.use(errorHandler);
  });

  describe("GET /books", () => {
    it("should return list of books", async () => {
      // Arrange
      const mockBooks = [
        { id: 2, name: "I, Robot" },
        { id: 1, name: "Brave New World" },
      ];

      mockBookController.getBooks.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json(mockBooks);
        }
      );

      // Act
      const response = await request(app).get("/books");

      // Assert
      expect(response.status).toBe(200);
      expect(mockBookController.getBooks).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockBooks);
    });

    it("should handle errors", async () => {
      // Arrange
      mockBookController.getBooks.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new Error("Database error"));
        }
      );

      // Act
      const response = await request(app).get("/books");

      // Assert
      expect(response.status).toBe(500);
      expect(mockBookController.getBooks).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: "Internal server error",
        },
      });
    });
  });

  describe("GET /books/:id", () => {
    it("should return book with score", async () => {
      // Arrange
      const mockBook = {
        id: 2,
        name: "I, Robot",
        score: "5.33",
      };

      mockBookController.getBookById.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json(mockBook);
        }
      );

      // Act
      const response = await request(app).get("/books/2");

      // Assert
      expect(response.status).toBe(200);
      expect(mockBookController.getBookById).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockBook);
    });

    it("should handle not found error", async () => {
      // Arrange
      mockBookController.getBookById.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new BookNotFoundError("2"));
        }
      );

      // Act
      const response = await request(app).get("/books/2");

      // Assert
      expect(response.status).toBe(404);
      expect(mockBookController.getBookById).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: "Book not found with id: 2",
        },
      });
    });
  });

  describe("POST /books", () => {
    it("should create book successfully", async () => {
      // Arrange
      const requestBody = { name: "I, Robot" };

      mockBookController.createBook.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(201).send();
        }
      );

      // Act
      const response = await request(app).post("/books").send(requestBody);

      // Assert
      expect(response.status).toBe(201);
      expect(mockBookController.createBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({});
    });

    it("should handle validation errors", async () => {
      // Arrange
      const invalidBook = { name: "" };

      // Act
      const response = await request(app).post("/books").send(invalidBook);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [
            {
              field: "name",
              message: "Book name is required",
            },
            {
              field: "name",
              message: "Book name must be between 2 and 100 characters",
            },
          ],
        },
      });
    });
  });
});
