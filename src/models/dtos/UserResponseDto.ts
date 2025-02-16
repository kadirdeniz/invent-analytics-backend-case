export interface BookHistoryDto {
  name: string;
  userScore: number;
}

export interface CurrentBookDto {
  name: string;
}

export interface UserBooksDto {
  past: BookHistoryDto[];
  present: CurrentBookDto[];
}

export interface UserResponseDto {
  id: string;
  name: string;
  books: UserBooksDto;
}

// Mapper için kullanılacak factory method
export class UserResponseDtoFactory {
  static create(data: {
    id: string;
    name: string;
    books?: {
      past?: { name: string; userScore: number }[];
      present?: { name: string }[];
    };
  }): UserResponseDto {
    return {
      id: data.id,
      name: data.name,
      books: {
        past: data.books?.past || [],
        present: data.books?.present || [],
      },
    };
  }
}
