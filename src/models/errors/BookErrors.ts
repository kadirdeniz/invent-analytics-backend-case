export class BookNotFoundError extends Error {
  constructor(id: string | number) {
    super(`Book not found with id: ${id}`);
    this.name = "BookNotFoundError";
  }
}
