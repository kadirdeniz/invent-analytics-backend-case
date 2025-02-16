export interface BookListItem {
  id: number;
  name: string;
}

export interface BookDetailItem {
  id: number;
  name: string;
  score: string | null;
}

export interface IBookService {
  getBooks(): Promise<BookListItem[]>;
  getBookById(id: number): Promise<BookDetailItem>;
  createBook(data: { name: string }): Promise<void>;
}
