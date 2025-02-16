import {
  createContainer,
  asClass,
  asValue,
  AwilixContainer,
  Lifetime,
  InjectionMode,
} from "awilix";
import { ConfigService } from "./config";
import { AppDataSource } from "./database";

// Controllers
import { UserController } from "../controllers/UserController";
import { BookController } from "../controllers/BookController";

// Services
import { UserService } from "../services/UserService";
import { BookService } from "../services/BookService";

// Repositories
import { UserRepository } from "../repositories/UserRepository";
import { BookRepository } from "../repositories/BookRepository";

// Mappers
import { UserMapper } from "../models/mappers/UserMapper";
import { UserDtoMapper } from "../models/mappers/UserDtoMapper";
import { BookMapper } from "../models/mappers/BookMapper";

function createAppContainer(): AwilixContainer {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  // Infrastructure
  container.register({
    configService: asClass(ConfigService, { lifetime: Lifetime.SINGLETON }),
    dataSource: asValue(AppDataSource),
  });

  // Mappers
  container.register({
    userMapper: asClass(UserMapper, { lifetime: Lifetime.SINGLETON }),
    userDtoMapper: asClass(UserDtoMapper, { lifetime: Lifetime.SINGLETON }),
    bookMapper: asClass(BookMapper, { lifetime: Lifetime.SINGLETON }),
  });

  // Repositories
  container.register({
    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    bookRepository: asClass(BookRepository, { lifetime: Lifetime.SINGLETON }),
  });

  // Services
  container.register({
    userService: asClass(UserService, { lifetime: Lifetime.SINGLETON }),
    bookService: asClass(BookService, { lifetime: Lifetime.SINGLETON }),
  });

  // Controllers
  container.register({
    userController: asClass(UserController, { lifetime: Lifetime.SINGLETON }),
    bookController: asClass(BookController, { lifetime: Lifetime.SINGLETON }),
  });

  return container;
}

export const container = createAppContainer();
