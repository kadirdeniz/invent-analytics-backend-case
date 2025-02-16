import { UserResponseDtoFactory } from "../UserResponseDto";

describe("UserResponseDtoFactory", () => {
  it("should create dto with empty book lists when no books provided", () => {
    const result = UserResponseDtoFactory.create({
      id: "1",
      name: "John Doe",
    });

    expect(result).toEqual({
      id: "1",
      name: "John Doe",
      books: {
        past: [],
        present: [],
      },
    });
  });

  it("should create dto with provided book lists", () => {
    const result = UserResponseDtoFactory.create({
      id: "2",
      name: "Enes Faruk Meniz",
      books: {
        past: [
          {
            name: "I, Robot",
            userScore: 5,
          },
          {
            name: "The Hitchhiker's Guide to the Galaxy",
            userScore: 10,
          },
        ],
        present: [
          {
            name: "Brave New World",
          },
        ],
      },
    });

    expect(result).toEqual({
      id: "2",
      name: "Enes Faruk Meniz",
      books: {
        past: [
          {
            name: "I, Robot",
            userScore: 5,
          },
          {
            name: "The Hitchhiker's Guide to the Galaxy",
            userScore: 10,
          },
        ],
        present: [
          {
            name: "Brave New World",
          },
        ],
      },
    });
  });
});
