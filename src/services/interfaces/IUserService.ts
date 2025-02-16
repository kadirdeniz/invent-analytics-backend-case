import { User } from "../../models/domain/User";
import { CreateUserDto } from "../../models/dtos/CreateUserDto";
import { UserResponseDto } from "../../models/dtos/UserResponseDto";

interface UserListItem {
  id: string;
  name: string;
}

export interface IUserService {
  createUser(dto: CreateUserDto): Promise<User>;
  getUserById(id: string): Promise<UserResponseDto>;
  getUsers(): Promise<UserListItem[]>;
  borrowBook(userId: string, bookId: string): Promise<void>;
}
