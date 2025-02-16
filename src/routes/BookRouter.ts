import { Router } from "express";
import { container } from "../config/container";
import { BookController } from "../controllers/BookController";
import { createBookValidation } from "../validations/bookValidation";
import { validate } from "../middleware/validation/validationMiddleware";

export class BookRouter {
  private router: Router;

  constructor(private readonly bookController: BookController) {
    if (!bookController) {
      throw new Error("BookController is required");
    }
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.bookController.getBooks);
    this.router.get("/:id", this.bookController.getBookById);
    this.router.post(
      "/",
      createBookValidation,
      validate,
      this.bookController.createBook
    );
  }

  getRouter(): Router {
    return this.router;
  }
}

// Factory function for creating router instances
export function createBookRouter(
  controller: BookController = container.resolve("bookController")
): Router {
  return new BookRouter(controller).getRouter();
}

// Singleton instance for production use
export const bookRouter = createBookRouter();
