import { UserService } from "../UserService";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { User } from "../../models/domain/User";
import { UserDtoMapper } from "../../models/mappers/UserDtoMapper";
import { container } from "../../config/container";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from "@/models/errors/UserErrors";

describe("UserService", () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let userService: UserService;
  let dtoMapper: UserDtoMapper;

  beforeEach(() => {
    // Mock repository setup
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    dtoMapper = container.resolve("userDtoMapper");
    userService = new UserService(mockUserRepository, dtoMapper);
  });

  describe("createUser", () => {
    it("should successfully create a user", async () => {
      // Arrange
      const createUserDto = {
        name: "John Doe",
        email: "john@example.com",
      };

      const mockUser: User = {
        id: "mock-uuid",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await userService.createUser(createUserDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should throw UserAlreadyExistsError when email exists", async () => {
      // Arrange
      const createUserDto = {
        name: "John Doe",
        email: "john@example.com",
      };

      const existingUser: User = {
        id: "existing-uuid",
        name: "Existing User",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        UserAlreadyExistsError
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate database errors", async () => {
      // Arrange
      const createUserDto = {
        name: "John Doe",
        email: "john@example.com",
      };

      const dbError = new Error("Database connection failed");
      mockUserRepository.findByEmail.mockRejectedValue(dbError);

      // Act & Assert
      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        dbError
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser = new User({
        id: "test-uuid",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById("test-uuid");

      // Assert
      expect(result).toEqual({
        id: "test-uuid",
        name: "John Doe",
        books: {
          past: [],
          present: [],
        },
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith("test-uuid");
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById("non-existent")).rejects.toThrow(
        UserNotFoundError
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent");
    });

    it("should propagate repository errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockUserRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.getUserById("test-uuid")).rejects.toThrow(error);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("test-uuid");
    });
  });

  describe("getUsers", () => {
    it("should return list of users", async () => {
      // Arrange
      const mockUsers = [
        new User({
          id: "2",
          name: "Enes Faruk Meniz",
          email: "enes@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new User({
          id: "1",
          name: "Eray Aslan",
          email: "eray@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getUsers();

      // Assert
      expect(result).toEqual([
        { id: "2", name: "Enes Faruk Meniz" },
        { id: "1", name: "Eray Aslan" },
      ]);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockUserRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.getUsers()).rejects.toThrow(error);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("borrowBook", () => {
    it("should successfully borrow a book", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";

      mockUserRepository.findById.mockResolvedValue(
        new User({
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      // Act
      await userService.borrowBook(userId, bookId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.borrowBook).toHaveBeenCalledWith(
        userId,
        bookId
      );
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      // Arrange
      const userId = "999";
      const bookId = "4";

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.borrowBook(userId, bookId)).rejects.toThrow(
        UserNotFoundError
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.borrowBook).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      // Arrange
      const userId = "2";
      const bookId = "4";
      const error = new Error("Database error");

      mockUserRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.borrowBook(userId, bookId)).rejects.toThrow(
        error
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.borrowBook).not.toHaveBeenCalled();
    });
  });

  describe("returnBook", () => {
    it("should successfully return a book", async () => {
      // Arrange
      const userId = "123";
      const bookId = "456";
      const score = 4.5;
      const mockUser = new User({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.returnBook.mockResolvedValue();

      // Act
      await userService.returnBook(userId, bookId, score);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.returnBook).toHaveBeenCalledWith(
        userId,
        bookId,
        score
      );
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      // Arrange
      const userId = "999";
      const bookId = "456";
      const score = 4.5;
      const mockUser = new User({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.returnBook(userId, bookId, score)
      ).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.returnBook).not.toHaveBeenCalled();
    });
  });
});
