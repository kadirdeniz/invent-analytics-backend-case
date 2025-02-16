import { Book } from "../../models/domain/Book";
import { AppDataSource } from "../../config/database";
import { BookRepository } from "../BookRepository";
import { BookMapper } from "@/models/mappers/BookMapper";
import { BookEntity } from "@/models/entities/Book";
import { UserBookHistoryEntity } from "@/models/entities/UserBookHistory";
import { UserEntity } from "@/models/entities/User";

describe("BookRepository", () => {
  let bookRepository: BookRepository;
  let mapper: BookMapper;

  beforeEach(async () => {
    // Test database'ini temizle
    await AppDataSource.getRepository(UserBookHistoryEntity).delete({});
    await AppDataSource.getRepository(BookEntity).delete({});

    // Mock mapper oluştur
    mapper = {
      toEntity: jest.fn().mockImplementation((book: Book) => {
        const entity = new BookEntity(); // BookEntity instance'ı oluşturalım
        entity.name = book.name;
        entity.createdAt = book.createdAt;
        entity.updatedAt = book.updatedAt;
        return entity;
      }),
      toDomainModel: jest.fn().mockImplementation(
        (entity: BookEntity) =>
          new Book({
            id: entity.id,
            name: entity.name,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
          })
      ),
      toResponseDto: jest.fn(),
    } as unknown as jest.Mocked<BookMapper>;

    // Repository oluştur
    bookRepository = new BookRepository(AppDataSource, mapper);
  });

  describe("findAll", () => {
    it("should return all books", async () => {
      // Arrange
      const books = [
        new Book({
          name: "I, Robot",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Book({
          name: "Brave New World",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      // Create books in database
      for (const book of books) {
        const entity = mapper.toEntity(book);
        await AppDataSource.getRepository(BookEntity).save(entity);
      }

      // Act
      const result = await bookRepository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("I, Robot");
      expect(result[1].name).toBe("Brave New World");
    });

    it("should return empty array when no books exist", async () => {
      // Act
      const result = await bookRepository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return book when exists", async () => {
      // Arrange
      const book = new Book({
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const entity = mapper.toEntity(book);
      await AppDataSource.getRepository(BookEntity).save(entity);

      // Act
      const result = await bookRepository.findById(entity.id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.name).toBe("I, Robot");
    });

    it("should return null when book not found", async () => {
      // Act
      const result = await bookRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getAverageScore", () => {
    it("should return average score when ratings exist", async () => {
      // Arrange
      const book = new Book({
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const entity = mapper.toEntity(book);
      const savedBook =
        await AppDataSource.getRepository(BookEntity).save(entity);

      // Create test users first
      await AppDataSource.getRepository(UserEntity).save([
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Test User 1",
          email: "test1@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
          name: "Test User 2",
          email: "test2@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Add ratings
      await AppDataSource.getRepository(UserBookHistoryEntity).save([
        {
          userId: "550e8400-e29b-41d4-a716-446655440000",
          bookId: savedBook.id,
          userScore: 5,
          returnDate: new Date(),
        },
        {
          userId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
          bookId: savedBook.id,
          userScore: 4,
          returnDate: new Date(),
        },
      ]);

      // Act
      const result = await bookRepository.getAverageScore(savedBook.id);

      // Assert
      expect(result).toBe(4.5);
    });

    it("should return null when no ratings exist", async () => {
      // Arrange
      const book = new Book({
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const entity = mapper.toEntity(book);
      const savedBook =
        await AppDataSource.getRepository(BookEntity).save(entity);

      // Act
      const result = await bookRepository.getAverageScore(savedBook.id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should successfully create a book in database", async () => {
      // Arrange
      const book = new Book({
        name: "I, Robot",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await bookRepository.create(book);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe("I, Robot");

      // Verify in database
      const savedBook = await AppDataSource.getRepository(BookEntity).findOneBy(
        {
          id: result.id,
        }
      );

      expect(savedBook).toBeDefined();
      expect(savedBook?.name).toBe("I, Robot");
    });
  });
});
