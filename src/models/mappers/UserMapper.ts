import { IEntityMapper } from "./base/IEntityMapper";
import { User } from "../domain/User";
import { UserEntity } from "../entities/User";

export class UserMapper implements IEntityMapper<User, UserEntity> {
  toDomainModel(entity: UserEntity): User {
    return new User({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.email = domain.email;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
