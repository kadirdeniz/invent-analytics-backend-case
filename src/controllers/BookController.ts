import { BookService } from "@/services/BookService";
import { Request, Response, NextFunction } from "express";

export class BookController {
  constructor(private readonly bookService: BookService) {
    this.getBooks = this.getBooks.bind(this);
    this.getBookById = this.getBookById.bind(this);
    this.createBook = this.createBook.bind(this);
  }

  async getBooks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const books = await this.bookService.getBooks();
      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }

  async getBookById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      const book = await this.bookService.getBookById(id);
      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  }

  async createBook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.bookService.createBook(req.body);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
}
