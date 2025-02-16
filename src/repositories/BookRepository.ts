import { DataSource, Repository } from "typeorm";
import { BookEntity } from "../models/entities/Book";
import { IBookRepository } from "./interfaces/IBookRepository";
import { Book } from "../models/domain/Book";
import { BookMapper } from "../models/mappers/BookMapper";
import { UserBookHistoryEntity } from "../models/entities/UserBookHistory";

export class BookRepository implements IBookRepository {
  private repository: Repository<BookEntity>;
  private historyRepository: Repository<UserBookHistoryEntity>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly bookMapper: BookMapper
  ) {
    if (!this.dataSource.isInitialized) {
      throw new Error("DataSource is not initialized");
    }
    this.repository = this.dataSource.getRepository(BookEntity);
    this.historyRepository = this.dataSource.getRepository(
      UserBookHistoryEntity
    );
  }

  async findAll(): Promise<Book[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.bookMapper.toDomainModel(entity));
  }

  async findById(id: number): Promise<Book | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.bookMapper.toDomainModel(entity) : null;
  }

  async getAverageScore(bookId: number): Promise<number | null> {
    const result = await this.historyRepository
      .createQueryBuilder("history")
      .select("AVG(history.userScore)", "average")
      .where("history.bookId = :bookId", { bookId })
      .getRawOne();

    return result?.average ? Number(result.average) : null;
  }

  async create(book: Book): Promise<Book> {
    const entity = this.bookMapper.toEntity(book);
    const savedEntity = await this.repository.save(entity);
    return this.bookMapper.toDomainModel(savedEntity);
  }
}
