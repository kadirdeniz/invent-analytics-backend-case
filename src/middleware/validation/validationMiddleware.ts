import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import logger from "../../utils/logger";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation failed", {
      path: req.path,
      errors: errors.array(),
    });

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors.array().map((e) => ({
          field: e.type === "field" ? e.path : e.type,
          message: e.msg,
        })),
      },
    });
  }

  next();
};
