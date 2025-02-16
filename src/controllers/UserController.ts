import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { CreateUserDto } from "../models/dtos/CreateUserDto";
import {
  UserNotFoundError,
  InvalidScoreError,
} from "../models/errors/UserErrors";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateUserDto = req.body;
      await this.userService.createUser(dto);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await this.userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async borrowBook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, bookId } = req.params;
      await this.userService.borrowBook(userId, bookId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  returnBook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId, bookId } = req.params;
      const { score } = req.body;

      // Score validasyonu
      if (score < 0 || score > 5 || !Number.isFinite(score)) {
        throw new InvalidScoreError();
      }

      await this.userService.returnBook(userId, bookId, score);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
