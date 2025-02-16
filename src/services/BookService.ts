import {
  IBookService,
  BookListItem,
  BookDetailItem,
} from "./interfaces/IBookService";
import { IBookRepository } from "../repositories/interfaces/IBookRepository";
import { BookNotFoundError } from "../models/errors/BookErrors";
import { Book } from "../models/domain/Book";

export class BookService implements IBookService {
  constructor(private readonly bookRepository: IBookRepository) {}

  async getBooks(): Promise<BookListItem[]> {
    const books = await this.bookRepository.findAll();
    return books.map((book) => ({
      id: book.id!,
      name: book.name,
    }));
  }

  async getBookById(id: number): Promise<BookDetailItem> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new BookNotFoundError(id);
    }

    const score = await this.bookRepository.getAverageScore(id);
    return {
      id: book.id!,
      name: book.name,
      score: score ? score.toFixed(2) : null,
    };
  }

  async createBook(data: { name: string }): Promise<void> {
    const book = new Book({
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.bookRepository.create(book);
  }
}
