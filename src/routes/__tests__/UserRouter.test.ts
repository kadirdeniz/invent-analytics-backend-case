// Mock container before other imports
jest.mock("../../config/container", () => ({
  container: {
    resolve: jest.fn().mockImplementation((name: string) => {
      if (name === "userController") {
        return {
          getUsers: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          borrowBook: jest.fn(),
          returnBook: jest.fn(),
        };
      }
    }),
  },
}));

// Singleton instance'ı mock'la
jest.mock("../userRouter", () => {
  const actual = jest.requireActual("../userRouter");
  return {
    ...actual,
    userRouter: undefined, // Singleton'ı devre dışı bırak
  };
});

import request from "supertest";
import express, { NextFunction } from "express";
import { UserController } from "../../controllers/UserController";
import { createUserRouter } from "../../routes/UserRouter";
import { errorHandler } from "../../middleware/errorHandler";
import { UserAlreadyExistsError } from "../../models/errors/UserErrors";
import { jsonErrorHandler } from "../../middleware/jsonErrorHandler";
import { Request, Response } from "express";
import {
  UserNotFoundError,
  BookAlreadyBorrowedError,
  InvalidScoreError,
  BookNotBorrowedError,
} from "../../models/errors/UserErrors";

describe("UserRouter", () => {
  let app: express.Application;
  let mockUserController: jest.Mocked<UserController>;

  beforeEach(() => {
    // Mock controller setup
    mockUserController = {
      getUsers: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
    } as unknown as jest.Mocked<UserController>;

    // Express app setup
    app = express();
    app.use(express.json());
    app.use(jsonErrorHandler);
    app.use("/users", createUserRouter(mockUserController));
    app.use(errorHandler);
  });

  describe("POST /users", () => {
    it("should successfully create a user and return 201", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(201).send();
      });

      const response = await request(app).post("/users").send(requestBody);

      expect(response.status).toBe(201);
      expect(mockUserController.create).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({});
    });

    it("should return 409 when email already exists", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockUserController.create.mockImplementation(async (req, res, next) => {
        next(new UserAlreadyExistsError(requestBody.email));
      });

      const response = await request(app).post("/users").send(requestBody);

      expect(response.status).toBe(409);
      expect(mockUserController.create).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        error: {
          code: "USER_ALREADY_EXISTS",
          message: `User with email ${requestBody.email} already exists`,
        },
        success: false,
      });
    });

    it("should return 400 when request body is invalid", async () => {
      // Arrange
      const invalidUser = { name: "", email: "" };

      // Act
      const response = await request(app).post("/users").send(invalidUser);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUserController.create).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [
            {
              field: "name",
              message: "Name is required",
            },
            {
              field: "name",
              message: "Name must be between 2 and 50 characters",
            },
            {
              field: "email",
              message: "Email is required",
            },
            {
              field: "email",
              message: "Invalid email format",
            },
          ],
        },
      });
    });

    it("should return 400 when email format is invalid", async () => {
      // Arrange
      const invalidUser = { name: "John Doe", email: "invalid-email" };

      // Act
      const response = await request(app).post("/users").send(invalidUser);

      // Assert
      expect(response.status).toBe(400);
      expect(mockUserController.create).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: [
            {
              field: "email",
              message: "Invalid email format",
            },
          ],
        },
      });
    });

    it("should return 500 when an unexpected error occurs", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockUserController.create.mockImplementation(async (req, res, next) => {
        next(new Error("Unexpected database error"));
      });

      const response = await request(app).post("/users").send(requestBody);

      expect(response.status).toBe(500);
      expect(mockUserController.create).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: "Internal server error",
        },
      });
    });

    it("should return 400 when request body is invalid JSON", async () => {
      const response = await request(app)
        .post("/users")
        .set("Content-Type", "application/json")
        .send("invalid json{");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid JSON payload",
        },
      });
    });
  });

  describe("GET /users/:id", () => {
    it("should return 200 and user when exists", async () => {
      // Arrange
      const userId = "mock-uuid";
      mockUserController.getById.mockImplementation(async (req, res) => {
        res.status(200).json({
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Act
      const response = await request(app).get(`/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockUserController.getById).toHaveBeenCalledTimes(1);
      expect(response.body).toMatchObject({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      const userId = "non-existent-id";
      mockUserController.getById.mockImplementation(async (req, res, next) => {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: `User with id ${userId} not found`,
          },
        });
      });

      // Act
      const response = await request(app).get(`/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(mockUserController.getById).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: `User with id ${userId} not found`,
        },
      });
    });
  });

  describe("GET /users", () => {
    it("should return list of users", async () => {
      // Arrange
      const mockUsers = [
        { id: "2", name: "Enes Faruk Meniz" },
        { id: "1", name: "Eray Aslan" },
        { id: "4", name: "Kadir Mutlu" },
        { id: "3", name: "Sefa Eren Şahin" },
      ];

      mockUserController.getUsers.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json(mockUsers);
        }
      );

      // Act
      const response = await request(app).get("/users");

      // Assert
      expect(response.status).toBe(200);
      expect(mockUserController.getUsers).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockUsers);
    });

    it("should handle errors", async () => {
      // Arrange
      mockUserController.getUsers.mockImplementation(async (req, res, next) => {
        next(new Error("Database error"));
      });

      // Act
      const response = await request(app).get("/users");

      // Assert
      expect(response.status).toBe(500);
      expect(mockUserController.getUsers).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: "Internal server error",
        },
      });
    });
  });

  describe("POST /users/:userId/borrow/:bookId", () => {
    it("should successfully borrow a book", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";

      mockUserController.borrowBook.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(204).send();
        }
      );

      // Act
      const response = await request(app).post(
        `/users/${userId}/borrow/${bookId}`
      );

      // Assert
      expect(response.status).toBe(204);
      expect(mockUserController.borrowBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({});
    });

    it("should handle not found error", async () => {
      // Arrange
      const userId = "999";
      const bookId = "999";

      mockUserController.borrowBook.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new UserNotFoundError(userId));
        }
      );

      // Act
      const response = await request(app).post(
        `/users/${userId}/borrow/${bookId}`
      );

      // Assert
      expect(response.status).toBe(404);
      expect(mockUserController.borrowBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: `User with id ${userId} not found`,
        },
      });
    });

    it("should handle book already borrowed error", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";

      mockUserController.borrowBook.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new BookAlreadyBorrowedError(bookId));
        }
      );

      // Act
      const response = await request(app).post(
        `/users/${userId}/borrow/${bookId}`
      );

      // Assert
      expect(response.status).toBe(400);
      expect(mockUserController.borrowBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "BOOK_ALREADY_BORROWED",
          message: `Book with id ${bookId} is already borrowed`,
        },
      });
    });
  });

  describe("POST /users/:userId/return/:bookId", () => {
    it("should successfully return a book", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";
      const score = 4.5;

      mockUserController.returnBook.mockImplementation(
        async (req: Request, res: Response) => {
          res.status(204).send();
        }
      );

      // Act
      const response = await request(app)
        .post(`/users/${userId}/return/${bookId}`)
        .send({ score });

      // Assert
      expect(response.status).toBe(204);
      expect(mockUserController.returnBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({});
    });

    it("should handle invalid score error", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";
      const score = 5.5; // Geçersiz skor

      mockUserController.returnBook.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new InvalidScoreError());
        }
      );

      // Act
      const response = await request(app)
        .post(`/users/${userId}/return/${bookId}`)
        .send({ score });

      // Assert
      expect(response.status).toBe(400);
      expect(mockUserController.returnBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "INVALID_SCORE",
          message: "Score must be between 0 and 5",
        },
      });
    });

    it("should handle book not borrowed error", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";
      const score = 4.5;

      mockUserController.returnBook.mockImplementation(
        async (req: Request, res: Response, next: NextFunction) => {
          next(new BookNotBorrowedError());
        }
      );

      // Act
      const response = await request(app)
        .post(`/users/${userId}/return/${bookId}`)
        .send({ score });

      // Assert
      expect(response.status).toBe(403);
      expect(mockUserController.returnBook).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: "BOOK_NOT_BORROWED",
          message: "Book is not borrowed by this user",
        },
      });
    });
  });
});
