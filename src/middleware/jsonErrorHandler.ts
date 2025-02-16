import { Request, Response, NextFunction } from "express";

export const jsonErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid JSON payload",
      },
    });
  }
  next(err);
};
