import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./User";
import { BookEntity } from "./Book";

@Entity("user_book_history")
export class UserBookHistoryEntity {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  bookId: number;

  @Column({
    type: "decimal",
    precision: 2,
    scale: 1,
    nullable: true,
    default: null,
  })
  userScore: number | null;

  @Column({ type: "timestamp", nullable: true })
  returnDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ManyToOne(() => BookEntity)
  @JoinColumn({ name: "bookId" })
  book: BookEntity;
}
