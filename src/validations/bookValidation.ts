import { body } from "express-validator";

export const createBookValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Book name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Book name must be between 2 and 100 characters"),
];
