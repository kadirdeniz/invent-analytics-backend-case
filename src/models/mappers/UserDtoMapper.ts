import { IDtoMapper } from "./base/IDtoMapper";
import { User } from "../domain/User";
import { CreateUserDto } from "../dtos/CreateUserDto";
import {
  UserResponseDto,
  UserResponseDtoFactory,
} from "../dtos/UserResponseDto";

export class UserDtoMapper
  implements IDtoMapper<User, CreateUserDto, UserResponseDto>
{
  toDomainModel(dto: CreateUserDto): User {
    return new User({
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toResponseDto(domain: User): UserResponseDto {
    return UserResponseDtoFactory.create({
      id: domain.id!,
      name: domain.name,
      // Şimdilik boş, daha sonra book repository eklenince güncellenecek
      books: {
        past: [],
        present: [],
      },
    });
  }
}
