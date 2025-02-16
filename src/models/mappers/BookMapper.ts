import { Book } from "../domain/Book";
import { BookEntity } from "../entities/Book";
import { IDtoMapper } from "./base/IDtoMapper";

export class BookMapper implements IDtoMapper<Book, BookEntity, never> {
  toEntity(domain: Book): BookEntity {
    const entity = new BookEntity();
    entity.id = domain.id!;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  toDomainModel(entity: BookEntity): Book {
    return new Book({
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toResponseDto(): never {
    throw new Error("Method not implemented.");
  }
}
