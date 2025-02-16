import { BookService } from "../BookService";
import { IBookRepository } from "../../repositories/interfaces/IBookRepository";
import { Book } from "@/models/domain/Book";
import { BookNotFoundError } from "@/models/errors/BookErrors";

describe("BookService", () => {
  let mockBookRepository: jest.Mocked<IBookRepository>;
  let bookService: BookService;

  beforeEach(() => {
    // Mock repository setup
    mockBookRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      getAverageScore: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<IBookRepository>;

    bookService = new BookService(mockBookRepository);
  });

  describe("getBooks", () => {
    it("should return list of books", async () => {
      // Arrange
      const mockBooks = [
        new Book({
          id: 2,
          name: "I, Robot",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Book({
          id: 1,
          name: "Brave New World",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockBookRepository.findAll.mockResolvedValue(mockBooks);

      // Act
      const result = await bookService.getBooks();

      // Assert
      expect(result).toEqual([
        { id: 2, name: "I, Robot" },
        { id: 1, name: "Brave New World" },
      ]);
      expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockBookRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(bookService.getBooks()).rejects.toThrow(error);
      expect(mockBookRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBookById", () => {
    it("should return book with score", async () => {
      // Arrange
      const mockBook = new Book({
        id: 2,
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.getAverageScore.mockResolvedValue(5.33);

      // Act
      const result = await bookService.getBookById(2);

      // Assert
      expect(result).toEqual({
        id: 2,
        name: "I, Robot",
        score: "5.33",
      });
      expect(mockBookRepository.findById).toHaveBeenCalledWith(2);
      expect(mockBookRepository.getAverageScore).toHaveBeenCalledWith(2);
    });

    it("should handle not found error", async () => {
      // Arrange
      mockBookRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(bookService.getBookById(2)).rejects.toThrow(
        BookNotFoundError
      );
      expect(mockBookRepository.findById).toHaveBeenCalledWith(2);
      expect(mockBookRepository.getAverageScore).not.toHaveBeenCalled();
    });

    it("should return null score when no ratings exist", async () => {
      // Arrange
      const mockBook = new Book({
        id: 2,
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBookRepository.findById.mockResolvedValue(mockBook);
      mockBookRepository.getAverageScore.mockResolvedValue(null);

      // Act
      const result = await bookService.getBookById(2);

      // Assert
      expect(result).toEqual({
        id: 2,
        name: "I, Robot",
        score: null,
      });
    });
  });

  describe("createBook", () => {
    it("should create book successfully", async () => {
      // Arrange
      const createBookData = { name: "I, Robot" };
      const mockBook = new Book({
        name: createBookData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBookRepository.create.mockResolvedValue(mockBook);

      // Act
      await bookService.createBook(createBookData);

      // Assert
      expect(mockBookRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createBookData.name,
        })
      );
    });

    it("should handle repository errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockBookRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(
        bookService.createBook({ name: "I, Robot" })
      ).rejects.toThrow(error);
    });
  });
});
