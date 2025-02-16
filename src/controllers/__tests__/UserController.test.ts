import { Request, Response, NextFunction } from "express";
import { UserController } from "../UserController";
import { UserService } from "../../services/UserService";
import { User } from "../../models/domain/User";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
  BookAlreadyBorrowedError,
} from "../../models/errors/UserErrors";
import { UserResponseDto } from "../../models/dtos/UserResponseDto";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { UserDtoMapper } from "@/models/mappers/UserDtoMapper";

describe("UserController", () => {
  let mockUserService: jest.Mocked<UserService>;
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Mock service setup
    mockUserService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      userRepository: {} as IUserRepository,
      dtoMapper: {} as UserDtoMapper,
      getUsers: jest.fn(),
      borrowBook: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    // Controller setup
    userController = new UserController(mockUserService);

    // Mock request/response/next
    mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("create", () => {
    it("should successfully create a user and return 201", async () => {
      // Arrange
      const mockUser: User = {
        id: "mock-uuid",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      await userController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 409 when email already exists", async () => {
      // Arrange
      const error = new UserAlreadyExistsError("john@example.com");
      mockUserService.createUser.mockRejectedValue(error);

      // Act
      await userController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      // Arrange
      const userId = "test-uuid";
      const mockUser: UserResponseDto = {
        id: userId,
        name: "John Doe",
        books: {
          past: [],
          present: [],
        },
      };

      mockRequest = {
        params: { id: userId },
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      const userId = "non-existent";
      mockRequest = {
        params: { id: userId },
      };

      mockUserService.getUserById.mockRejectedValue(
        new UserNotFoundError(userId)
      );

      // Act
      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: `User with id ${userId} not found`,
        },
      });
    });

    it("should pass other errors to error handler", async () => {
      // Arrange
      const userId = "test-uuid";
      const error = new Error("Database error");

      mockRequest = {
        params: { id: userId },
      };

      mockUserService.getUserById.mockRejectedValue(error);

      // Act
      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getUsers", () => {
    it("should return list of users successfully", async () => {
      // Arrange
      const mockUsers = [
        { id: "2", name: "Enes Faruk Meniz" },
        { id: "1", name: "Eray Aslan" },
        { id: "4", name: "Kadir Mutlu" },
        { id: "3", name: "Sefa Eren Şahin" },
      ];

      mockUserService.getUsers.mockResolvedValue(mockUsers);

      // Act
      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockUserService.getUsers.mockRejectedValue(error);

      // Act
      await userController.getUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("borrowBook", () => {
    it("should successfully borrow a book", async () => {
      // Arrange
      mockRequest.params = {
        userId: "2",
        bookId: "4",
      };

      mockUserService.borrowBook.mockResolvedValue(undefined);

      // Act
      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.borrowBook).toHaveBeenCalledWith("2", "4");
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle user not found error", async () => {
      // Arrange
      mockRequest.params = {
        userId: "999",
        bookId: "4",
      };

      mockUserService.borrowBook.mockRejectedValue(
        new UserNotFoundError("999")
      );

      // Act
      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.borrowBook).toHaveBeenCalledWith("999", "4");
      expect(mockNext).toHaveBeenCalledWith(expect.any(UserNotFoundError));
    });

    it("should handle book already borrowed error", async () => {
      // Arrange
      mockRequest.params = {
        userId: "2",
        bookId: "4",
      };

      mockUserService.borrowBook.mockRejectedValue(
        new BookAlreadyBorrowedError("4")
      );

      // Act
      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.borrowBook).toHaveBeenCalledWith("2", "4");
      expect(mockNext).toHaveBeenCalledWith(
        expect.any(BookAlreadyBorrowedError)
      );
    });
  });
});
