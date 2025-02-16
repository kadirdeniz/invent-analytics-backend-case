import { User } from "../../models/domain/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  borrowBook(userId: string, bookId: string): Promise<void>;
  returnBook(userId: string, bookId: string, score: number): Promise<void>;
}
