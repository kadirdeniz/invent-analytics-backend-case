import { BaseError } from "./BaseError";

export class UserAlreadyExistsError extends BaseError {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      409,
      "USER_ALREADY_EXISTS"
    );
  }
}

export class UserNotFoundError extends BaseError {
  constructor(userId: string) {
    super(`User with id ${userId} not found`, 404, "USER_NOT_FOUND");
  }
}

export class BookAlreadyBorrowedError extends BaseError {
  constructor(bookId: string | number) {
    super(
      `Book with id ${bookId} is already borrowed`,
      400,
      "BOOK_ALREADY_BORROWED"
    );
  }
}

export class InvalidScoreError extends BaseError {
  constructor() {
    super("Score must be between 0 and 5", 400, "INVALID_SCORE");
  }
}

export class BookNotBorrowedError extends BaseError {
  constructor() {
    super("Book is not borrowed by this user", 403, "BOOK_NOT_BORROWED");
  }
}
