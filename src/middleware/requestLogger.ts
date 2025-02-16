import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request
  logger.info("Incoming request", {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      "user-agent": req.get("user-agent"),
      "content-type": req.get("content-type"),
    },
    body: req.body,
  });

  // Override response.json to log response
  const originalJson = res.json;
  res.json = function (body) {
    const responseTime = Date.now() - startTime;

    logger.info("Outgoing response", {
      requestId: req.id,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      body,
    });

    return originalJson.call(this, body);
  };

  next();
};
