import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { User } from "../models/domain/User";
import { CreateUserDto } from "../models/dtos/CreateUserDto";
import { UserDtoMapper } from "../models/mappers/UserDtoMapper";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../models/errors/UserErrors";
import { UserResponseDto } from "../models/dtos/UserResponseDto";
import { IUserService } from "./interfaces/IUserService";

interface UserListItem {
  id: string;
  name: string;
}

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userDtoMapper: UserDtoMapper
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const user = this.userDtoMapper.toDomainModel(dto);
    return this.userRepository.create(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    return this.userDtoMapper.toResponseDto(user);
  }

  async getUsers(): Promise<UserListItem[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id!,
      name: user.name,
    }));
  }

  async borrowBook(userId: string, bookId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    await this.userRepository.borrowBook(userId, bookId);
  }

  async returnBook(
    userId: string,
    bookId: string,
    score: number
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    await this.userRepository.returnBook(userId, bookId, score);
  }
}
