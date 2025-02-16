import { Request, Response, NextFunction } from "express";
import { BookNotFoundError } from "../models/errors/BookErrors";
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  BookAlreadyBorrowedError,
  InvalidScoreError,
  BookNotBorrowedError,
} from "../models/errors/UserErrors";
import logger from "../utils/logger";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Error caught by error handler", {
    error: error.message,
    stack: error.stack,
  });

  // Handle specific errors
  if (error instanceof UserNotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof BookNotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        message: error.message,
      },
    });
  }

  if (error instanceof UserAlreadyExistsError) {
    return res.status(409).json({
      success: false,
      error: {
        message: error.message,
        code: "USER_ALREADY_EXISTS",
      },
    });
  }

  if (error instanceof BookAlreadyBorrowedError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof InvalidScoreError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof BookNotBorrowedError) {
    return res.status(403).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Default error response
  const response: ErrorResponse = {
    success: false,
    error: {
      message: "Internal server error",
    },
  };
  res.status(500).json(response);
};
