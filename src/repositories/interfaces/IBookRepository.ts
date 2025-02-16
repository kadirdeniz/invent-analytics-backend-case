import { Book } from "../../models/domain/Book";

export interface IBookRepository {
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | null>;
  getAverageScore(bookId: number): Promise<number | null>;
  create(book: Book): Promise<Book>;
}
