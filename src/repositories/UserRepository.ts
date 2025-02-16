import { DataSource, Repository, IsNull } from "typeorm";
import { UserEntity } from "../models/entities/User";
import { UserBookHistoryEntity } from "../models/entities/UserBookHistory";
import { BookEntity } from "../models/entities/Book";
import { BookNotFoundError } from "../models/errors/BookErrors";
import { BookAlreadyBorrowedError } from "../models/errors/UserErrors";
import { IUserRepository } from "./interfaces/IUserRepository";
import { User } from "../models/domain/User";
import { UserMapper } from "../models/mappers/UserMapper";
import { BookNotBorrowedError } from "../models/errors/UserErrors";

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;
  private userBookHistoryRepository: Repository<UserBookHistoryEntity>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly userMapper: UserMapper
  ) {
    if (!this.dataSource.isInitialized) {
      throw new Error("DataSource is not initialized");
    }
    this.repository = this.dataSource.getRepository(UserEntity);
    this.userBookHistoryRepository = this.dataSource.getRepository(
      UserBookHistoryEntity
    );
  }

  async create(user: User): Promise<User> {
    const entity = this.userMapper.toEntity(user);
    const savedEntity = await this.repository.save(entity);
    return this.userMapper.toDomainModel(savedEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email },
    });

    return entity ? this.userMapper.toDomainModel(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.userMapper.toDomainModel(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.userMapper.toDomainModel(entity));
  }

  async borrowBook(userId: string, bookId: string): Promise<void> {
    // Check if book exists
    const book = await this.dataSource
      .getRepository(BookEntity)
      .createQueryBuilder("book")
      .where("book.id = :id", { id: Number(bookId) })
      .getOne();

    if (!book) {
      throw new BookNotFoundError(bookId);
    }

    // Check if book is already borrowed
    const existingBorrow = await this.userBookHistoryRepository.findOne({
      where: {
        bookId: Number(bookId),
        returnDate: IsNull(),
      },
    });

    if (existingBorrow) {
      throw new BookAlreadyBorrowedError(bookId);
    }

    // Create borrow record
    const userBookHistory = new UserBookHistoryEntity();
    userBookHistory.userId = userId;
    userBookHistory.bookId = Number(bookId);
    userBookHistory.userScore = null; // Default olarak null
    userBookHistory.returnDate = null;

    await this.userBookHistoryRepository.save(userBookHistory);
  }

  async returnBook(
    userId: string,
    bookId: string,
    score: number
  ): Promise<void> {
    // Kitabın ödünç alınmış olup olmadığını kontrol et
    const borrowedBook = await this.userBookHistoryRepository.findOne({
      where: {
        userId,
        bookId: Number(bookId),
        returnDate: IsNull(),
      },
    });

    if (!borrowedBook) {
      throw new BookNotBorrowedError();
    }

    // Kitabı iade et ve puanı güncelle
    borrowedBook.returnDate = new Date();
    borrowedBook.userScore = score;
    await this.userBookHistoryRepository.save(borrowedBook);
  }
}
