import { Request, Response, NextFunction } from "express";
import { BookController } from "../BookController";
import { BookService } from "@/services/BookService";
import { BookNotFoundError } from "@/models/errors/BookErrors";

describe("BookController", () => {
  let mockBookService: jest.Mocked<BookService>;
  let bookController: BookController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Mock service setup
    mockBookService = {
      getBooks: jest.fn(),
      getBookById: jest.fn(),
      createBook: jest.fn(),
    } as unknown as jest.Mocked<BookService>;

    // Controller setup
    bookController = new BookController(mockBookService);

    // Mock request/response/next
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("getBooks", () => {
    it("should return list of books successfully", async () => {
      // Arrange
      const mockBooks = [
        { id: 2, name: "I, Robot" },
        { id: 1, name: "Brave New World" },
      ];

      mockBookService.getBooks.mockResolvedValue(mockBooks);

      // Act
      await bookController.getBooks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBookService.getBooks).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBooks);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockBookService.getBooks.mockRejectedValue(error);

      // Act
      await bookController.getBooks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBookService.getBooks).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("getBookById", () => {
    it("should return book with score successfully", async () => {
      // Arrange
      const mockBook = {
        id: 2,
        name: "I, Robot",
        score: "5.33",
      };

      mockRequest.params = { id: "2" };
      mockBookService.getBookById.mockResolvedValue(mockBook);

      // Act
      await bookController.getBookById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBookService.getBookById).toHaveBeenCalledWith(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBook);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle not found error", async () => {
      // Arrange
      mockRequest.params = { id: "2" };
      mockBookService.getBookById.mockRejectedValue(new BookNotFoundError("2"));

      // Act
      await bookController.getBookById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBookService.getBookById).toHaveBeenCalledWith(2);
      expect(mockNext).toHaveBeenCalledWith(expect.any(BookNotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("createBook", () => {
    it("should create book successfully", async () => {
      // Arrange
      const requestBody = { name: "I, Robot" };
      mockRequest.body = requestBody;

      // Act
      await bookController.createBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBookService.createBook).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      // Arrange
      const error = new Error("Database error");
      mockRequest.body = { name: "I, Robot" };
      mockBookService.createBook.mockRejectedValue(error);

      // Act
      await bookController.createBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
