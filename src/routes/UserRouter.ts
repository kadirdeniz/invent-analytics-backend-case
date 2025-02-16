import { Router } from "express";
import { container } from "../config/container";
import { UserController } from "../controllers/UserController";
import { createUserValidation } from "../validations/userValidation";
import { validate } from "../middleware/validation/validationMiddleware";

export class UserRouter {
  private router: Router;

  constructor(private readonly userController: UserController) {
    if (!userController) {
      throw new Error("UserController is required");
    }
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.userController.getUsers);
    this.router.get("/:id", this.userController.getById);
    this.router.post(
      "/",
      createUserValidation,
      validate,
      this.userController.create
    );
    this.router.post("/:userId/borrow/:bookId", this.userController.borrowBook);
    this.router.post("/:userId/return/:bookId", this.userController.returnBook);
  }

  getRouter(): Router {
    return this.router;
  }
}

// Factory function for creating router instances
export function createUserRouter(
  controller: UserController = container.resolve("userController")
): Router {
  return new UserRouter(controller).getRouter();
}

// Singleton instance for production use
export const userRouter = createUserRouter();
