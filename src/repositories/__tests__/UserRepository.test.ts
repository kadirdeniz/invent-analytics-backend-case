import { UserRepository } from "../UserRepository";
import { User } from "../../models/domain/User";
import { AppDataSource } from "../../config/database";
import { UserEntity } from "../../models/entities/User";
import { UserMapper } from "../../models/mappers/UserMapper";
import { IsNull } from "typeorm";
import { UserBookHistoryEntity } from "../../models/entities/UserBookHistory";
import { BookEntity } from "../../models/entities/Book";
import { BookNotBorrowedError } from "@/models/errors/UserErrors";

// Test için UUID'ler oluşturalım
const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let mapper: UserMapper;

  beforeEach(async () => {
    // Test database'ini temizle
    await AppDataSource.getRepository(UserBookHistoryEntity).delete({});
    await AppDataSource.getRepository(UserEntity).delete({});
    await AppDataSource.getRepository(BookEntity).delete({});

    // Mock mapper oluştur
    mapper = {
      toEntity: jest.fn().mockImplementation((user: User) => {
        const entity = new UserEntity(); // UserEntity instance'ı oluşturalım
        entity.name = user.name;
        entity.email = user.email;
        entity.createdAt = user.createdAt;
        entity.updatedAt = user.updatedAt;
        return entity;
      }),
      toDomainModel: jest.fn().mockImplementation(
        (entity: UserEntity) =>
          new User({
            id: entity.id,
            name: entity.name,
            email: entity.email,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
          })
      ),
    } as jest.Mocked<UserMapper>;

    // Repository oluştur
    userRepository = new UserRepository(AppDataSource, mapper);
  });

  describe("create", () => {
    it("should successfully create a user in database", async () => {
      // Arrange
      const domainUser = new User({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await userRepository.create(domainUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(domainUser.name);
      expect(result.email).toBe(domainUser.email);

      // Verify in database
      const savedUser = await AppDataSource.getRepository(UserEntity).findOneBy(
        {
          email: domainUser.email,
        }
      );

      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe(domainUser.name);
      expect(savedUser?.email).toBe(domainUser.email);
    });

    it("should find user by email when exists", async () => {
      // Arrange
      const existingUser = new User({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.create(existingUser);

      // Act
      const result = await userRepository.findByEmail("john@example.com");

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe(existingUser.email);
      expect(result?.name).toBe(existingUser.name);
    });

    it("should return null when user not found by email", async () => {
      // Act
      const result = await userRepository.findByEmail(
        "nonexistent@example.com"
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      // Arrange
      const users = [
        new User({
          id: "1",
          name: "Enes Faruk Meniz",
          email: "enes@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new User({
          id: "2",
          name: "Eray Aslan",
          email: "eray@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      // Create users in database using repository
      await Promise.all(users.map((user) => userRepository.create(user)));

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toContain("Enes Faruk Meniz");
      expect(result.map((u) => u.name)).toContain("Eray Aslan");
    });

    it("should return empty array when no users exist", async () => {
      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("borrowBook", () => {
    it("should successfully borrow a book", async () => {
      // Arrange
      const bookEntity = new BookEntity();
      bookEntity.name = "Test Book";
      const savedBook =
        await AppDataSource.getRepository(BookEntity).save(bookEntity);
      const bookId = savedBook.id.toString(); // Kaydedilen kitabın id'sini kullanalım

      // Create a user
      const user = new User({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const createdUser = await userRepository.create(user);
      const userId = createdUser.id; // Oluşturulan user'ın id'sini kullanalım

      // Act
      await userRepository.borrowBook(userId, bookId);

      // Assert
      const borrowedBook = await AppDataSource.getRepository(
        UserBookHistoryEntity
      ).findOne({
        where: {
          userId,
          bookId: Number(bookId),
          returnDate: IsNull(),
        },
      });

      expect(borrowedBook).toBeDefined();
      expect(borrowedBook?.userId).toBe(userId);
      expect(borrowedBook?.bookId).toBe(Number(bookId));
    });

    // ... diğer test senaryoları aynı
  });

  describe("returnBook", () => {
    it("should successfully return a book", async () => {
      // Arrange
      const user = new User({
        id: TEST_USER_ID, // UUID kullan
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.create(user);

      const bookEntity = new BookEntity();
      bookEntity.name = "Test Book";
      const savedBook =
        await AppDataSource.getRepository(BookEntity).save(bookEntity);

      // Kitabı ödünç alalım
      await userRepository.borrowBook(TEST_USER_ID, savedBook.id.toString());

      // Act
      await userRepository.returnBook(
        TEST_USER_ID,
        savedBook.id.toString(),
        4.5
      );

      // Assert
      const returnedBook = await AppDataSource.getRepository(
        UserBookHistoryEntity
      ).findOne({
        where: {
          userId: TEST_USER_ID,
          bookId: savedBook.id,
        },
      });

      expect(returnedBook).toBeDefined();
      expect(returnedBook?.returnDate).toBeDefined();
      expect(returnedBook?.userScore).toBe(4.5);
    });

    it("should throw BookNotBorrowedError when book is not borrowed", async () => {
      // Arrange
      const user = new User({
        id: TEST_USER_ID, // UUID kullan
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.create(user);

      const bookEntity = new BookEntity();
      bookEntity.name = "Test Book";
      const savedBook =
        await AppDataSource.getRepository(BookEntity).save(bookEntity);

      // Act & Assert
      await expect(
        userRepository.returnBook(TEST_USER_ID, savedBook.id.toString(), 4.5)
      ).rejects.toThrow(BookNotBorrowedError);
    });
  });
});
